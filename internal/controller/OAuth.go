package controller

import (
	"keydrive/internal/model"
	"keydrive/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
	"strings"
)

func GetAuthenticatedUser(ctx *gin.Context) (user model.User, found bool) {
	result := ctx.Value(ContextKeyUser)
	if result == nil {
		return model.User{}, false
	}
	return result.(model.User), true
}

func Authenticate(tokens *service.Token) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("authorization")
		if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
			// this is a token!
			startOfToken := strings.LastIndex(authHeader, " ")
			accessToken := authHeader[startOfToken+1:]
			token, foundToken := tokens.GetToken(c, accessToken)
			if foundToken {
				client := token.GetClient()
				c.Set(ContextKeyClient, client)
				c.Set(ContextKeyUser, token.User)
			}
		}
		c.Next()
	}
}

func RequireAuthentication() gin.HandlerFunc {
	return func(c *gin.Context) {
		_, found := GetAuthenticatedUser(c)
		if !found {
			c.AbortWithStatusJSON(
				http.StatusUnauthorized,
				ApiError{Status: http.StatusUnauthorized},
			)
			return
		}
		c.Next()
	}
}

func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		user, found := GetAuthenticatedUser(c)
		if found && user.IsAdmin {
			c.Next()
			return
		}
		c.AbortWithStatusJSON(
			http.StatusForbidden,
			ApiError{Status: http.StatusForbidden},
		)
	}
}

func Token(users *service.User, clients *model.ClientDetailsService, tokens *service.Token, passwordEncoder *service.BcryptEncoder) gin.HandlerFunc {
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

		client := clients.GetClient(c, clientId)
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
		c.Set(ContextKeyClient, client)

		user, foundUser := users.GetUser(username)
		if !foundUser {
			c.JSON(
				http.StatusBadRequest,
				TokenError{
					ErrorType:        "invalid_grant",
					ErrorDescription: "",
				},
			)
			return
		}
		if !passwordEncoder.Compare(password, user.GetHashedPassword()) {
			c.JSON(
				http.StatusBadRequest,
				TokenError{
					ErrorType:        "invalid_grant",
					ErrorDescription: "",
				},
			)
			return
		}
		c.Set(ContextKeyUser, user)

		modelToken := tokens.CreateToken(user, uuid.NewString())
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
			AccessToken: modelToken.AccessToken,
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
