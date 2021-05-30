package oauth

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
)

func Authenticate(server *Server) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("authorization")
		if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
			// this is a token!
			startOfToken := strings.LastIndex(authHeader, " ")
			accessToken := authHeader[startOfToken+1:]
			token := server.TokenService.GetToken(c, accessToken)
			if token != nil {
				client := token.GetClient()
				c.Set(contextKeyClient, client)
				user := token.GetUser()
				c.Set(contextKeyUser, user)
			}
		}
		c.Next()
	}
}

func RequireAuthentication() gin.HandlerFunc {
	return func(c *gin.Context) {
		user := GetUser(c)
		if user == nil {
			c.Status(http.StatusUnauthorized)
			c.Abort()
			return
		}
		c.Next()
	}
}
