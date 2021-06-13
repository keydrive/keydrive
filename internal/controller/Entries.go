package controller

import (
	"clearcloud/internal/model"
	"clearcloud/internal/service"
	"clearcloud/pkg/oauth"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"mime/multipart"
	"net/http"
	"net/url"
)

type LibraryAccess struct {
	model.Library
	CanWrite bool
}

func getAccessToLib(c *gin.Context, libs *service.Library, writeAccess bool, tx *gorm.DB) (model.Library, error) {
	libraryId, ok := intParam(c, "libraryId")
	var library LibraryAccess
	if !ok {
		return library.Library, ApiError{Status: http.StatusNotFound}
	}
	user := oauth.GetUser(c).(model.User)
	if err := libs.GetLibrariesWithAccessForUser(user, tx).Take(&library, libraryId).Error; err != nil {
		return library.Library, ApiError{Status: http.StatusNotFound}
	}
	if writeAccess && !library.CanWrite {
		return library.Library, ApiError{Status: http.StatusForbidden}
	}
	return library.Library, nil
}

// ListEntries
// @Tags Files
// @Router /api/libraries/{libraryId}/entries [get]
// @Summary Search the collection of files and folders
// @Security OAuth2
// @Produce  json
// @Success 200 {array} service.FileInfo
// @Param parent query string false "The parent folder"
// @Param libraryId path int true "The library id"
func ListEntries(db *gorm.DB, libs *service.Library, fs *service.FileSystem) gin.HandlerFunc {
	return func(c *gin.Context) {
		library, err := getAccessToLib(c, libs, false, db)
		if err != nil {
			writeError(c, err)
			return
		}
		parentPath := c.DefaultQuery("parent", "")
		entries, err := fs.GetEntriesForLibrary(library, parentPath)
		if err != nil {
			writeError(c, err)
			return
		}
		c.JSON(http.StatusOK, entries)
	}
}

// GetEntry
// @Tags Files
// @Router /api/libraries/{libraryId}/entries/{path} [get]
// @Summary Search the collection of files and folders
// @Security OAuth2
// @Produce  json
// @Success 200 {object} service.FileInfo
// @Param path path string true "The url encoded path"
// @Param libraryId path int true "The library id"
func GetEntry(db *gorm.DB, libs *service.Library, fs *service.FileSystem) gin.HandlerFunc {
	return func(c *gin.Context) {
		library, err := getAccessToLib(c, libs, false, db)
		if err != nil {
			writeError(c, err)
			return
		}
		path := c.Param("path")
		if path == "" {
			simpleError(c, http.StatusBadRequest)
			return
		}
		path, err = url.QueryUnescape(path)
		if err != nil {
			writeError(c, ApiError{
				Status:      http.StatusBadRequest,
				Description: "path parameter must be url encoded",
			})
			return
		}
		entry, err := fs.GetEntryMetadata(library, path)
		if err != nil {
			writeError(c, err)
			return
		}
		c.JSON(http.StatusOK, entry)
	}
}

type CreateEntryDTO struct {
	Name   string                `binding:"" form:"name"`
	Parent string                `binding:"" form:"parent"`
	Data   *multipart.FileHeader `binding:"" form:"data"`
}

// CreateEntry
// @Tags Files
// @Router /api/libraries/{libraryId}/entries [post]
// @Summary Create a new file or folder
// @Security OAuth2
// @Produce  json
// @Accept multipart/form-data
// @Success 200 {object} service.FileInfo
// @Param libraryId path int true "The library id"
// @Param name formData string false "The name of the new entry. Required when creating a folder."
// @Param parent formData string false "The path to the parent folder. When missing this creates a file or folder in the root of the library."
// @Param data formData file false "The file contents. Required when creating a file."
func CreateEntry(db *gorm.DB, libs *service.Library, fs *service.FileSystem) gin.HandlerFunc {
	return func(c *gin.Context) {
		var request CreateEntryDTO
		if err := c.ShouldBind(&request); err != nil {
			writeError(c, err)
			return
		}
		err := db.Transaction(func(tx *gorm.DB) error {
			library, err := getAccessToLib(c, libs, true, tx)
			if err != nil {
				return err
			}

			if request.Data == nil {
				if request.Name == "" {
					return ApiError{Status: http.StatusBadRequest, Description: "A name is required when creating a folder"}
				}
				created, err := fs.CreateFolderInLibrary(library, request.Name, request.Parent)
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
				created, err := fs.CreateFileInLibrary(library, request.Name, request.Parent, request.Data)
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

// DeleteEntry
// @Tags Files
// @Router /api/libraries/{libraryId}/entries/{path} [delete]
// @Summary Delete a file or folder
// @Security OAuth2
// @Produce  json
// @Success 204
// @Param path path string true "The url encoded path"
// @Param libraryId path int true "The library id"
func DeleteEntry(db *gorm.DB, libs *service.Library, fs *service.FileSystem) gin.HandlerFunc {
	return func(c *gin.Context) {
		library, err := getAccessToLib(c, libs, false, db)
		if err != nil {
			writeError(c, err)
			return
		}
		path := c.Param("path")
		if path == "" {
			simpleError(c, http.StatusBadRequest)
			return
		}
		path, err = url.QueryUnescape(path)
		if err != nil {
			writeError(c, ApiError{
				Status:      http.StatusBadRequest,
				Description: "path parameter must be url encoded",
			})
			return
		}
		err = fs.DeleteEntryInLibrary(library, path)
		if err != nil {
			writeError(c, err)
			return
		}
		c.Status(http.StatusNoContent)
	}
}
