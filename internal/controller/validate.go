package controller

import (
	"encoding/json"
	"github.com/go-playground/validator"
	"net/http"
	"strings"
)

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
