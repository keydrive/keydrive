package controller

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func Static(fs http.FileSystem) gin.HandlerFunc {
	fileServer := http.FileServer(fs)
	return func(c *gin.Context) {
		fileServer.ServeHTTP(c.Writer, c.Request)
	}
}
