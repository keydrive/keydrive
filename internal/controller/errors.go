package controller

import (
	"net/http"
	"strings"
)

type ApiError struct {
	Status      int         `json:"status"`
	ShortError  string      `json:"error"`
	Description string      `json:"description,omitempty"`
	Details     interface{} `json:"details,omitempty"`
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
