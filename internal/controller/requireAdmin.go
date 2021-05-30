package controller

import (
	"clearcloud/internal/model"
	"clearcloud/pkg/oauth"
	"github.com/gin-gonic/gin"
	"net/http"
)

func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		userValue := oauth.GetUser(c)
		if userValue != nil {
			user, ok := userValue.(model.User)
			if ok && user.IsAdmin {
				c.Next()
				return
			}
		}
		simpleError(c, http.StatusForbidden)
		c.Abort()
	}
}
