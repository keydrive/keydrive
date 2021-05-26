package controller

import (
	"clearcloud/pkg/logger"
	"encoding/json"
	"errors"
	"github.com/go-playground/validator"
	"gorm.io/gorm"
	"net/http"
	"strings"
)

var log = logger.NewConsole(logger.LevelDebug, "API")

type ApiError struct {
	Status      int         `json:"status"`
	ShortError  string      `json:"error"`
	Description string      `json:"description,omitempty"`
	Details     interface{} `json:"details,omitempty"`
}

var validate = validator.New()

type validationError struct {
	Field      string   `json:"field"`
	Constraint string   `json:"constraint"`
	Param      string   `json:"param,omitempty"`
	Codes      []string `json:"codes"`
}

func mapErrors(validationErrors validator.ValidationErrors) []validationError {
	result := make([]validationError, len(validationErrors))
	for i, fieldError := range validationErrors {
		err := validationError{
			Field:      strings.ToLower(fieldError.Field()[:1]) + fieldError.Field()[1:],
			Constraint: fieldError.Tag(),
			Param:      fieldError.Param(),
			Codes:      []string{},
		}

		fqn := fieldError.Namespace() + "." + fieldError.Tag()
		for {
			err.Codes = append(err.Codes, fqn)
			nextDot := strings.IndexRune(fqn, '.')
			if nextDot == -1 {
				break
			}
			fqn = fqn[nextDot+1:]
		}

		result[i] = err
	}
	return result
}

func withValidJsonBody(writer http.ResponseWriter, request *http.Request, target interface{}, handler jsonHandlerFunc) (interface{}, error) {
	err := json.NewDecoder(request.Body).Decode(target)
	if err != nil {
		return nil, ApiError{
			Status:      http.StatusBadRequest,
			Description: "invalid json request: " + err.Error(),
		}
	}
	err = validate.Struct(target)
	if err != nil {
		validationErrors := err.(validator.ValidationErrors)
		return nil, ApiError{
			Status:      http.StatusBadRequest,
			Description: "validation failure",
			Details:     mapErrors(validationErrors),
		}
	}
	data, err := handler(writer, request)
	return data, err
}

func (a ApiError) Error() string {
	return strings.TrimSpace(a.ShortError + " " + a.Description)
}

func writeJsonError(writer http.ResponseWriter, apiError ApiError) {
	if apiError.ShortError == "" {
		apiError.ShortError = http.StatusText(apiError.Status)
	}
	writeJson(writer, apiError.Status, apiError)
}

func simpleError(writer http.ResponseWriter, status int) {
	writeJsonError(writer, ApiError{Status: status})
}

func writeJson(writer http.ResponseWriter, status int, body interface{}) {
	if body == nil {
		writer.WriteHeader(http.StatusNoContent)
	} else {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(status)
		json.NewEncoder(writer).Encode(&body)
	}
}

type jsonHandlerFunc func(writer http.ResponseWriter, request *http.Request) (data interface{}, err error)

type SQLError interface {
	SQLState() string
}

func jsonEndpoint(status int, handler jsonHandlerFunc) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {

		data, err := handler(writer, request)
		if err == nil {
			writeJson(writer, status, data)
			return
		}

		if apiError, ok := err.(ApiError); ok {
			writeJsonError(writer, apiError)
			return
		}

		if sqlError, ok := err.(SQLError); ok {
			if sqlError.SQLState() == "23505" {
				// unique constraint violation
				simpleError(writer, http.StatusConflict)
				return
			}
		}
		if errors.Is(err, gorm.ErrRecordNotFound) {
			simpleError(writer, http.StatusNotFound)
			return
		}
		log.Error("Uncaught error in %s %s: %s", request.Method, request.URL.Path, err.Error())
		simpleError(writer, http.StatusInternalServerError)
	})
}
