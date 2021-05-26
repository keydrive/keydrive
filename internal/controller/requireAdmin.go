package controller

import (
	"clearcloud/internal/model"
	"clearcloud/pkg/oauth"
	"net/http"
)

func requireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		userValue := oauth.GetUser(request.Context())
		if userValue != nil {
			user, ok := userValue.(model.User)
			if ok && user.IsAdmin {
				next.ServeHTTP(writer, request)
				return
			}
		}
		simpleError(writer, http.StatusForbidden)
	})
}
