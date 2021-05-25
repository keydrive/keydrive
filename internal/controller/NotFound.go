package controller

import "net/http"

func NotFound() http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		simpleError(writer, http.StatusNotFound)
	})
}
