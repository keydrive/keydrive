package controller

import (
	"github.com/gin-gonic/gin"
	"keydrive/internal/service"
	"net/http"
)

func RequireDownloadToken(tokens *service.DownloadTokens) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, hasTokenString := c.GetQuery("token")
		if !hasTokenString {
			c.AbortWithStatusJSON(
				http.StatusBadRequest,
				ApiError{Status: http.StatusBadRequest},
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
