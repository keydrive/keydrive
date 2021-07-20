package controller

import (
	"clearcloud/internal/model"
	"clearcloud/internal/service"
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	"strings"
)

// Download
// @Tags Files
// @Router /api/download [get]
// @Summary Download a file
// @Success 200
// @Param token query string true "The download token"
func Download(fs *service.FileSystem) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.Value(ContextKeyDownloadToken).(model.DownloadToken)

		entry, err := fs.GetEntryMetadata(token.Library, token.Path)
		if err != nil {
			writeError(c, err)
			return
		}

		stream, err := fs.OpenFile(token.Library, token.Path)
		if err != nil {
			writeError(c, err)
			return
		}

		defer func(stream io.ReadCloser) {
			_ = stream.Close()
		}(stream)
		c.Header("Content-Type", entry.MimeType)
		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", strings.ReplaceAll(entry.Name, "\"", "\\\"")))
		_, _ = io.Copy(c.Writer, stream)
	}
}
