package controller

import (
	"clearcloud/internal/model"
	"clearcloud/internal/service"
	"clearcloud/pkg/oauth"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"mime/multipart"
	"net/http"
	"time"
)

type EntrySummary struct {
	ID       int            `json:"id"`
	Name     string         `json:"name"`
	Created  time.Time      `json:"created"`
	Modified time.Time      `json:"modified"`
	Category model.Category `json:"category"`
	ParentID int            `json:"parent,omitempty"`
}

type EntryPage struct {
	TotalElements int64          `json:"totalElements"`
	Elements      []EntrySummary `json:"elements"`
}

func getAccessToLib(c *gin.Context, libs *service.Library, tx *gorm.DB) (model.Library, error) {
	libraryId, ok := intParam(c, "libraryId")
	var library model.Library
	if !ok {
		return library, ApiError{Status: http.StatusNotFound}
	}
	user := oauth.GetUser(c).(model.User)
	if err := libs.GetLibrariesForUser(user, tx).Take(&library, libraryId).Error; err != nil {
		return library, ApiError{Status: http.StatusNotFound}
	}
	return library, nil
}

// ListEntries
// @Tags Files
// @Router /api/libraries/{libraryId}/entries [get]
// @Summary Search the collection of files and folders
// @Security OAuth2
// @Produce  json
// @Success 200 {object} EntryPage
// @Param page query int false "The page number to fetch" default(1)
// @Param limit query int false "The maximum number of elements to return" default(20)
// @Param libraryId path int true "The library id"
func ListEntries(db *gorm.DB, libs *service.Library, fs *service.FileSystem) gin.HandlerFunc {
	return func(c *gin.Context) {
		library, err := getAccessToLib(c, libs, db)
		if err != nil {
			writeError(c, err)
			return
		}

		var page EntryPage
		returnPage(c, fs.GetEntriesForLibrary(library, db).Order("name"), &page, &page.TotalElements, &page.Elements)
	}
}

type CreateEntryDTO struct {
	Name     string                `binding:"" form:"name"`
	ParentID int                   `binding:"" form:"parentId"`
	Data     *multipart.FileHeader `binding:"" form:"data"`
}

// CreateEntry
// @Tags Files
// @Router /api/libraries/{libraryId}/entries [post]
// @Summary Create a new file or folder
// @Security OAuth2
// @Produce  json
// @Accept multipart/form-data
// @Success 200 {object} model.Entry
// @Param libraryId path int true "The library id"
// @Param name formData string false "The name of the new entry. Required when creating a folder."
// @Param parentId formData int false "The id of the parent folder. When missing this creates a file or folder in the root of the library."
// @Param data formData file false "The file contents. Required when creating a file."
func CreateEntry(db *gorm.DB, libs *service.Library, fs *service.FileSystem) gin.HandlerFunc {
	return func(c *gin.Context) {
		var request CreateEntryDTO
		if err := c.ShouldBind(&request); err != nil {
			writeError(c, err)
			return
		}
		err := db.Transaction(func(tx *gorm.DB) error {
			library, err := getAccessToLib(c, libs, tx)
			if err != nil {
				return err
			}

			if request.Data == nil {
				if request.Name == "" {
					return ApiError{Status: http.StatusBadRequest, Description: "A name is required when creating a folder"}
				}
				created, err := fs.CreateFolderInLibrary(library, request.Name, request.ParentID, tx)
				if err != nil {
					return err
				}
				c.JSON(http.StatusCreated, created)
			} else {
				fileData, err := request.Data.Open()
				if err != nil {
					return err
				}
				defer fileData.Close()
				created, err := fs.CreateFileInLibrary(library, request.Name, request.ParentID, request.Data, tx)
				if err != nil {
					return err
				}
				c.JSON(http.StatusCreated, created)
			}

			return nil
		})
		if err != nil {
			writeError(c, err)
		}
	}
}
