package controller

import (
	"clearcloud/internal/service"
	"github.com/gin-gonic/gin"
	"net/http"
)

func RequireDownloadToken(tokens *service.DownloadTokens) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, hasTokenString := c.GetQuery("token")
		if !hasTokenString {
			c.AbortWithStatusJSON(
				http.StatusUnauthorized,
				ApiError{Status: http.StatusUnauthorized},
			)
			return
		}

		token, found := tokens.GetDownloadToken(tokenString)
		if !found {
			c.AbortWithStatusJSON(
				http.StatusUnauthorized,
				ApiError{Status: http.StatusUnauthorized},
			)
			return
		}

		c.Set(ContextKeyDownloadToken, token)
		c.Next()
	}
}
