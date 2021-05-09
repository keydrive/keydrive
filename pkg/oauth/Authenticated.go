package oauth

import (
	"context"
	"net/http"
	"strings"
)

func Authenticate(server *Server) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
			authHeader := request.Header.Get("authorization")
			if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
				// this is a token!
				startOfToken := strings.LastIndex(authHeader, " ")
				accessToken := authHeader[startOfToken+1:]
				token := server.TokenService.GetToken(request.Context(), accessToken)
				if token != nil {
					client := token.GetClient()
					ctx := context.WithValue(request.Context(), contextKeyClient, client)
					user := token.GetUser()
					ctx = context.WithValue(request.Context(), contextKeyUser, user)
					request = request.WithContext(ctx)
				}
			}
			next.ServeHTTP(writer, request)
		})
	}
}

func RequireAuthentication(server *Server) func(next http.Handler) http.Handler {
	auth := Authenticate(server)
	return func(next http.Handler) http.Handler {
		return auth(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
			user := GetUser(request.Context())
			if user == nil {
				http.Error(writer, "", http.StatusUnauthorized)
			} else {
				next.ServeHTTP(writer, request)
			}
		}))
	}
}
