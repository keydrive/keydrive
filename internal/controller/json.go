package controller

import (
	"clearcloud/pkg/logger"
	"errors"
	"github.com/gin-gonic/gin"
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

func (a ApiError) Error() string {
	return strings.TrimSpace(a.ShortError + " " + a.Description)
}

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

func writeJsonError(c *gin.Context, apiError ApiError) {
	if apiError.ShortError == "" {
		apiError.ShortError = http.StatusText(apiError.Status)
	}
	c.JSON(
		apiError.Status,
		apiError,
	)
}

func simpleError(c *gin.Context, status int) {
	writeJsonError(c, ApiError{Status: status})
}

type SQLError interface {
	SQLState() string
}

func writeError(c *gin.Context, err error) {
	if apiError, ok := err.(ApiError); ok {
		writeJsonError(c, apiError)
		return
	}

	if sqlError, ok := err.(SQLError); ok {
		if sqlError.SQLState() == "23505" {
			// unique constraint violation
			simpleError(c, http.StatusConflict)
			return
		}
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		simpleError(c, http.StatusNotFound)
		return
	}
	log.Error("Uncaught error in %s %s: %s", c.Request.Method, c.Request.URL.Path, err.Error())
	simpleError(c, http.StatusInternalServerError)
}
