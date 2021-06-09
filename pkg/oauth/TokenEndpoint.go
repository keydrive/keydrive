package oauth

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
)

func (s *Server) TokenEndpoint() gin.HandlerFunc {
	return func(c *gin.Context) {
		clientId := c.PostForm("client_id")
		grantType := c.PostForm("grant_type")
		username := c.PostForm("username")
		password := c.PostForm("password")
		if bUser, _, ok := c.Request.BasicAuth(); ok {
			clientId = bUser
		}
		if clientId == "" {
			c.JSON(
				http.StatusBadRequest,
				TokenError{
					ErrorType:        "invalid_request",
					ErrorDescription: "Missing required parameter client_id",
				},
			)
			return
		}
		if grantType == "" {
			c.JSON(
				http.StatusBadRequest,
				TokenError{
					ErrorType:        "invalid_request",
					ErrorDescription: "Missing required parameter grant_type",
				},
			)
			return
		}
		if username == "" {
			c.JSON(
				http.StatusBadRequest,
				TokenError{
					ErrorType:        "invalid_request",
					ErrorDescription: "Missing required parameter username",
				},
			)
			return
		}
		if password == "" {
			c.JSON(
				http.StatusBadRequest,
				TokenError{
					ErrorType:        "invalid_request",
					ErrorDescription: "Missing required parameter password",
				},
			)
			return
		}

		if grantType != "password" {
			c.JSON(
				http.StatusBadRequest,
				TokenError{
					ErrorType:        "unsupported_grant_type",
					ErrorDescription: "",
				},
			)
			return
		}

		client := s.ClientDetailsService.GetClient(c, clientId)
		if client == nil {
			c.JSON(
				http.StatusUnauthorized,
				TokenError{
					ErrorType:        "invalid_client",
					ErrorDescription: "",
				},
			)
			return
		}
		c.Set(contextKeyClient, client)

		user := s.UserDetailsService.GetUser(c, username)
		if user == nil {
			c.JSON(
				http.StatusBadRequest,
				TokenError{
					ErrorType:        "invalid_grant",
					ErrorDescription: "",
				},
			)
			return
		}
		if !s.PasswordEncoder.Compare(password, user.GetHashedPassword()) {
			c.JSON(
				http.StatusBadRequest,
				TokenError{
					ErrorType:        "invalid_grant",
					ErrorDescription: "",
				},
			)
			return
		}
		c.Set(contextKeyUser, user)

		modelToken := s.TokenService.CreateToken(c, uuid.NewString())
		if modelToken == nil {
			c.JSON(
				http.StatusBadRequest,
				TokenError{
					ErrorType:        "invalid_grant",
					ErrorDescription: "",
				},
			)
			return
		}
		tokenResponse := &TokenResponse{
			AccessToken: modelToken.GetAccessToken(),
			TokenType:   "bearer",
		}
		c.JSON(http.StatusOK, tokenResponse)
	}
}

type TokenError struct {
	ErrorType        string `json:"error"`
	ErrorDescription string `json:"error_description,omitempty"`
}

func (t TokenError) Error() string {
	return t.ErrorType
}

type TokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
}
