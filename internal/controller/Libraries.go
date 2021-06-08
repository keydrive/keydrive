package controller

import (
	"clearcloud/internal/model"
	"clearcloud/internal/service"
	"clearcloud/pkg/oauth"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
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
			Order("id")
		if user.IsAdmin {
			query.Select("*, TRUE as can_write")
		} else {
			query = query.Select("*, can_access_libraries.can_write as can_write")
		}
		returnPage(c, query, &page, &page.TotalElements, &page.Elements)
	}
}

type CreateLibraryDTO struct {
	Type model.LibraryType `json:"type" binding:"oneof='' generic books movies shows music"`
	Name string            `json:"name"  binding:"required"`
}

// CreateLibrary
// @Tags Files
// @Router /api/libraries [post]
// @Summary Add a new library
// @Security OAuth2
// @Produce  json
// @Param body body CreateLibraryDTO true "The new library"
// @Success 201 {object} model.Library
func CreateLibrary(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var create CreateLibraryDTO
		if err := c.ShouldBindJSON(&create); err != nil {
			writeError(c, err)
			return
		}
		if create.Type == "" {
			create.Type = model.TypeGeneric
		}
		newLibrary := model.Library{
			Type: create.Type,
			Name: create.Name,
		}
		if result := db.Save(&newLibrary); result.Error != nil {
			writeError(c, result.Error)
			return
		}
		c.JSON(http.StatusCreated, newLibrary)
	}
}
