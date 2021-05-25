package controller

import (
	"encoding/json"
	"net/http"
)

type apiError struct {
	Status      int    `json:"status"`
	Error       string `json:"error"`
	Description string `json:"description,omitempty"`
}

func error(res http.ResponseWriter, apiError apiError) {
	res.WriteHeader(apiError.Status)
	json.NewEncoder(res).Encode(&apiError)
}

func errorMethodNotAllowed(res http.ResponseWriter) {

}
