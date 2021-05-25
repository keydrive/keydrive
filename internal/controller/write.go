package controller

import (
	"encoding/json"
	"net/http"
)

func writeJson(writer http.ResponseWriter, status int, body interface{}) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(status)
	json.NewEncoder(writer).Encode(&body)
}

type jsonHandlerFunc func(writer http.ResponseWriter, request *http.Request) (interface{}, error)

func jsonEndpoint(status int, handler jsonHandlerFunc) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		data, err := handler(writer, request)
		if err == nil {
			writeJson(writer, status, &data)
		} else if apiError, ok := err.(ApiError); ok {
			writeJsonError(writer, apiError)
		} else {
			// TODO: error handling/logging
			simpleError(writer, http.StatusInternalServerError)
		}
	})
}
