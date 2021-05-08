package oauth

import (
	"context"
	"net/http"
)

func (s *Server) TokenEndpoint() http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		switch request.Method {
		case http.MethodPost:
			token, err := s.createToken(request)
			writer.Header().Set("Content-Type", "application/json")
			if err == nil {

			}
		default:
			http.Error(writer, "", http.StatusMethodNotAllowed)
		}
	})
}

func (s *Server) createToken(request *http.Request) (interface{}, error) {
	err := request.ParseForm()
	if err != nil {
		return nil, err
	}
	clientId := request.FormValue("client_id")
	clientSecret := request.FormValue("client_secret")
	grantType := request.FormValue("grant_type")
	username := request.FormValue("username")
	password := request.FormValue("password")
	if bUser, bPass, ok := request.BasicAuth(); ok {
		clientId = bUser
		clientSecret = bPass
	}

	// TODO: validation

	client := s.ClientDetailsService.GetClient(request.Context(), clientId)
	if client == nil {
		// TODO: return error
	}
	ctx := context.WithValue(request.Context(), contextKeyClient, client)

	// TODO: client_credentials?

	user := s.UserDetailsService.GetUser(ctx, username)
	if user == nil {
		// TODO: return error
	}
}
