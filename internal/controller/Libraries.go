package controller

import (
	"clearcloud/internal/model"
	"clearcloud/internal/service"
	"clearcloud/pkg/oauth"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type LibrarySummary struct {
	ID       int               `json:"id"`
	Type     model.LibraryType `json:"type"`
	Name     string            `json:"name"`
	CanWrite bool              `json:"canWrite"`
}

type LibraryPage struct {
	TotalElements int64            `json:"totalElements"`
	Elements      []LibrarySummary `json:"elements"`
}

// ListLibraries
// @Tags Files
// @Router /api/libraries [get]
// @Summary Search the collection of libraries
// @Security OAuth2
// @Produce  json
// @Success 200 {object} LibraryPage
// @Param page query int false "The page number to fetch" default(1)
// @Param limit query int false "The maximum number of elements to return" default(20)
func ListLibraries(db *gorm.DB, libs *service.Library) gin.HandlerFunc {
	return func(c *gin.Context) {
		var page LibraryPage
		user := oauth.GetUser(c).(model.User)
		query := libs.GetLibrariesForUser(user, db).
			Select("*, can_access_libraries.can_write as can_write").
			Order("id")
		returnPage(c, query, &page, &page.TotalElements, &page.Elements)
	}
}
