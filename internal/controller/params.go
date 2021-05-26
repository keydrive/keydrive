package controller

import (
	"net/http"
	"strconv"
	"strings"
)

func pathParamInt(req *http.Request, index int) int {
	param := pathParamString(req, index)
	if param == "" {
		return -1
	}
	if result, err := strconv.Atoi(param); err == nil {
		return result
	} else {
		return -1
	}
}

func pathParamString(req *http.Request, index int) string {
	pathParts := strings.Split(strings.Trim(req.URL.Path, "/"), "/")
	if len(pathParts) <= index {
		return ""
	}
	return pathParts[index]
}
