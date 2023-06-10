package controller

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
)

func Static(fs http.FileSystem) gin.HandlerFunc {
	fileServer := http.FileServer(fs)

	return func(c *gin.Context) {
		// Check if the file exists, serving the index if it does not.
		if _, err := fs.Open(c.Request.URL.Path); os.IsNotExist(err) {
			defer func(old string) {
				c.Request.URL.Path = old
			}(c.Request.URL.Path)

			// Overwrite the path with single slash, to let the file server serve index.html.
			// Note that the path can't be `index.html`, since the file server will redirect to `./` in that case.
			c.Request.URL.Path = "/"
		}

		fileServer.ServeHTTP(c.Writer, c.Request)
	}
}
