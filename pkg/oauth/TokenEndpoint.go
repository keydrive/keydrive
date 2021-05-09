package oauth

import (
	"context"
	"encoding/json"
	"github.com/google/uuid"
	"net/http"
)

func (s *Server) TokenEndpoint() http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		switch request.Method {
		case http.MethodPost:
			token, err := s.createToken(request)
			writer.Header().Set("Content-Type", "application/json")
			if err != nil {
				if tokenError, ok := err.(TokenError); ok {
					writer.WriteHeader(tokenError.Code)
					_ = json.NewEncoder(writer).Encode(tokenError)
				} else {
					http.Error(writer, err.Error(), http.StatusInternalServerError)
				}
			} else {
				_ = json.NewEncoder(writer).Encode(token)
			}
		default:
			http.Error(writer, "", http.StatusMethodNotAllowed)
		}
	})
}

type TokenError struct {
	ErrorType        string `json:"error"`
	ErrorDescription string `json:"error_description"`
	Code             int    `json:"-"`
}

func (t TokenError) Error() string {
	return t.ErrorType
}

type TokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
}

func (s *Server) createToken(request *http.Request) (*TokenResponse, error) {
	err := request.ParseForm()
	if err != nil {
		return nil, err
	}
	clientId := request.FormValue("client_id")
	grantType := request.FormValue("grant_type")
	username := request.FormValue("username")
	password := request.FormValue("password")
	if bUser, _, ok := request.BasicAuth(); ok {
		clientId = bUser
	}

	log.Info("%s %s %s %s %s", clientId, grantType, username, password)

	if clientId == "" {
		return nil, TokenError{
			ErrorType:        "invalid_request",
			ErrorDescription: "Missing required parameter client_id",
			Code:             http.StatusBadRequest,
		}
	}
	if grantType == "" {
		return nil, TokenError{
			ErrorType:        "invalid_request",
			ErrorDescription: "Missing required parameter grant_type",
			Code:             http.StatusBadRequest,
		}
	}
	if username == "" {
		return nil, TokenError{
			ErrorType:        "invalid_request",
			ErrorDescription: "Missing required parameter username",
			Code:             http.StatusBadRequest,
		}
	}
	if password == "" {
		return nil, TokenError{
			ErrorType:        "invalid_request",
			ErrorDescription: "Missing required parameter password",
			Code:             http.StatusBadRequest,
		}
	}

	if grantType != "password" {
		return nil, TokenError{
			ErrorType:        "unsupported_grant_type",
			ErrorDescription: "",
			Code:             http.StatusBadRequest,
		}
	}

	client := s.ClientDetailsService.GetClient(request.Context(), clientId)
	if client == nil {
		return nil, TokenError{
			ErrorType:        "invalid_client",
			ErrorDescription: "",
			Code:             http.StatusUnauthorized,
		}
	}
	ctx := context.WithValue(request.Context(), contextKeyClient, client)

	user := s.UserDetailsService.GetUser(ctx, username)
	if user == nil {
		return nil, TokenError{
			ErrorType:        "invalid_grant",
			ErrorDescription: "",
			Code:             http.StatusBadRequest,
		}
	}
	ctx = context.WithValue(ctx, contextKeyUser, user)

	modelToken := s.TokenService.CreateToken(ctx, uuid.NewString())
	tokenResponse := &TokenResponse{
		AccessToken: modelToken.GetAccessToken(),
		TokenType:   "bearer",
	}
	return tokenResponse, nil
}
