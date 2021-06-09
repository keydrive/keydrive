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
	Type     model.LibraryType `json:"type" enums:"generic,books,movies,shows,music"`
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
	Type model.LibraryType `json:"type" binding:"oneof='' generic books movies shows music" enums:"generic,books,movies,shows,music"`
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

type UpdateLibraryDTO struct {
	Name string `json:"name" binding:""`
}

// UpdateLibrary
// @Tags Files
// @Router /api/libraries/{libraryId} [patch]
// @Summary Update an existing library
// @Security OAuth2
// @Produce  json
// @Param body body UpdateLibraryDTO true "The changes"
// @Param libraryId path int true "The library id"
// @Success 200 {object} model.Library
func UpdateLibrary(db *gorm.DB, libs *service.Library) gin.HandlerFunc {
	return func(c *gin.Context) {
		libraryId, ok := intParam(c, "libraryId")
		if !ok {
			simpleError(c, http.StatusNotFound)
			return
		}
		user := oauth.GetUser(c).(model.User)

		var update UpdateLibraryDTO
		if err := c.ShouldBindJSON(&update); err != nil {
			writeError(c, err)
			return
		}
		err := db.Transaction(func(tx *gorm.DB) error {
			var library model.Library
			if result := libs.GetLibrariesForUser(user, tx).Take(&user, libraryId); result.Error != nil {
				return result.Error
			}
			if update.Name != "" {
				library.Name = update.Name
			}
			if result := tx.Save(&library); result.Error != nil {
				return result.Error
			}

			c.JSON(http.StatusOK, library)
			return nil
		})
		if err != nil {
			writeError(c, err)
			return
		}
	}
}

type LibraryDetails struct {
	model.Library
	SharedWith []model.CanAccessLibrary `json:"sharedWith" gorm:"foreignKey:LibraryID"`
}

// GetLibrary
// @Tags Files
// @Router /api/libraries/{libraryId} [get]
// @Summary Get library details
// @Security OAuth2
// @Produce  json
// @Param libraryId path int true "The library id"
// @Success 200 {object} LibraryDetails
func GetLibrary(db *gorm.DB, libs *service.Library) gin.HandlerFunc {
	return func(c *gin.Context) {
		libraryId, ok := intParam(c, "libraryId")
		if !ok {
			simpleError(c, http.StatusNotFound)
			return
		}
		user := oauth.GetUser(c).(model.User)
		var library LibraryDetails
		if result := libs.GetLibrariesForUser(user, db).Take(&library, libraryId); result.Error != nil {
			writeError(c, result.Error)
			return
		}
		if result := db.Preload("User").Find(&library.SharedWith, model.CanAccessLibrary{LibraryID: libraryId}); result.Error != nil {
			writeError(c, result.Error)
			return
		}

		c.JSON(http.StatusOK, library)
	}
}

// DeleteLibrary
// @Tags Files
// @Router /api/libraries/{libraryId} [delete]
// @Summary Delete a library
// @Description This does not delete the files in the library from the disk
// @Security OAuth2
// @Produce  json
// @Param libraryId path int true "The library id"
// @Success 204
func DeleteLibrary(db *gorm.DB, libs *service.Library) gin.HandlerFunc {
	return func(c *gin.Context) {
		libraryId, ok := intParam(c, "libraryId")
		if !ok {
			c.JSON(http.StatusNotFound, nil)
			return
		}
		user := oauth.GetUser(c).(model.User)

		err := db.Transaction(func(tx *gorm.DB) error {
			result := db.Where("library_id = ?", libraryId).Delete(model.CanAccessLibrary{})
			if result.Error != nil {
				return result.Error
			}

			result = libs.GetLibrariesForUser(user, db).Delete(&model.Library{
				ID: libraryId,
			})

			return result.Error
		})
		if err != nil {
			writeError(c, err)
			return
		} else {
			c.Status(http.StatusNoContent)
		}
	}
}

type ShareLibraryDTO struct {
	UserID   int  `json:"userId"  binding:"required"`
	CanWrite bool `json:"canWrite"  binding:""`
}

// ShareLibrary
// @Tags Files
// @Router /api/libraries/{libraryId}/shares [post]
// @Summary Share a library with a user
// @Security OAuth2
// @Produce  json
// @Param body body ShareLibraryDTO true "The rights to grant to a specific user"
// @Param libraryId path int true "The library id"
// @Success 204
func ShareLibrary(db *gorm.DB, libs *service.Library, users *service.User) gin.HandlerFunc {
	return func(c *gin.Context) {
		libraryId, ok := intParam(c, "libraryId")
		if !ok {
			c.JSON(http.StatusNotFound, nil)
			return
		}
		var share ShareLibraryDTO
		if err := c.ShouldBindJSON(&share); err != nil {
			writeError(c, err)
			return
		}

		user := oauth.GetUser(c).(model.User)
		var targetUser model.User
		var targetLibrary model.Library

		err := db.Transaction(func(tx *gorm.DB) error {
			result := users.GetUsers(tx).Take(&targetUser, share.UserID)
			if result.Error != nil {
				return result.Error
			}
			result = libs.GetLibrariesForUser(user, tx).Take(&targetLibrary, libraryId)
			if result.Error != nil {
				return result.Error
			}

			newShare := model.CanAccessLibrary{
				LibraryID: libraryId,
				UserID:    targetUser.ID,
				CanWrite:  share.CanWrite,
			}
			result = tx.Save(&newShare)
			return result.Error
		})
		if err != nil {
			writeError(c, err)
			return
		}
		c.Status(http.StatusNoContent)
	}
}

// UnshareLibrary
// @Tags Files
// @Router /api/libraries/{libraryId}/shares/{userId} [delete]
// @Summary Unshare a library
// @Security OAuth2
// @Produce  json
// @Param libraryId path int true "The library id"
// @Param userId path int true "The user id"
// @Success 204
func UnshareLibrary(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		libraryId, ok := intParam(c, "libraryId")
		if !ok {
			c.JSON(http.StatusNotFound, nil)
			return
		}
		userId, ok := intParam(c, "userId")
		if !ok {
			c.JSON(http.StatusNotFound, nil)
			return
		}
		result := db.Delete(model.CanAccessLibrary{}, model.CanAccessLibrary{LibraryID: libraryId, UserID: userId})
		if result.Error != nil {
			writeError(c, result.Error)
			return
		} else {
			c.Status(http.StatusNoContent)
		}
	}
}