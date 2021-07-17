package controller

import (
	"clearcloud/internal/model"
	"clearcloud/internal/service"
	"fmt"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"strings"
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
	user, _ := GetAuthenticatedUser(c)
	if err := libs.GetLibrariesWithAccessForUser(user, tx).Take(&library, libraryId).Error; err != nil {
		return library.Library, ApiError{Status: http.StatusNotFound}
	}
	if writeAccess && !library.CanWrite {
		return library.Library, ApiError{Status: http.StatusForbidden}
	}
	return library.Library, nil
}

func resolvePath(c *gin.Context, libs *service.Library, db *gorm.DB, writeAccess bool) (model.Library, string, error) {
	library, err := getAccessToLib(c, libs, writeAccess, db)
	if err != nil {
		return library, "", err
	}
	path := c.Param("path")
	if path == "" {
		return library, "", ApiError{Status: http.StatusBadRequest}
	}
	path, err = url.QueryUnescape(path)
	if err != nil {
		return library, "", ApiError{
			Status:      http.StatusBadRequest,
			Description: "path parameter must be url encoded",
		}
	}
	return library, path, nil
}

// ListEntries
// @Tags Files
// @Router /api/libraries/{libraryId}/entries [get]
// @Summary Search the collection of files and folders
// @Security OAuth2
// @Produce  json
// @Success 200 {array} service.FileInfo
// @Param parent query string false "The parent folder"
// @Param path query string false "The entry path. If this value is set, all other parameters are ignored and a maximum of 1 value is returned."
// @Param libraryId path int true "The library id"
func ListEntries(db *gorm.DB, libs *service.Library, fs *service.FileSystem) gin.HandlerFunc {
	return func(c *gin.Context) {
		library, err := getAccessToLib(c, libs, false, db)
		if err != nil {
			writeError(c, err)
			return
		}

		if path, ok := c.GetQuery("path"); ok {
			entry, err := fs.GetEntryMetadata(library, path)
			if err == nil {
				c.JSON(http.StatusOK, []service.FileInfo{entry})
				return
			}
			if os.IsNotExist(err) {
				c.JSON(http.StatusOK, []service.FileInfo{})
				return
			}
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

// DownloadEntry
// @Tags Files
// @Router /api/libraries/{libraryId}/entries/{path}/download [get]
// @Summary Download a file
// @Security OAuth2
// @Success 200
// @Param path path string true "The url encoded path"
// @Param libraryId path int true "The library id"
func DownloadEntry(db *gorm.DB, libs *service.Library, fs *service.FileSystem) gin.HandlerFunc {
	return func(c *gin.Context) {
		library, path, err := resolvePath(c, libs, db, false)
		if err != nil {
			writeError(c, err)
			return
		}
		entry, err := fs.GetEntryMetadata(library, path)
		if err != nil {
			writeError(c, err)
			return
		}
		stream, err := fs.OpenFile(library, path)
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
		library, path, err := resolvePath(c, libs, db, true)
		if err != nil {
			writeError(c, err)
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
