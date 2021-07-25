package controller

import (
	"keydrive/internal/service"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"io/ioutil"
	"net/http"
	"path/filepath"
)

type HealthCheckService struct {
	Name    string `json:"name"`
	Healthy bool   `json:"healthy"`
}

type HealthCheckResponse struct {
	Healthy  bool                 `json:"healthy"`
	Services []HealthCheckService `json:"services"`
}

// HealthCheckController
// @Tags System
// @Router /api/system/health [get]
// @Summary Run a simple healthcheck on all required systems
// @Produce  json
// @Success 200 {object} HealthCheckResponse
// @Success 503 {object} HealthCheckResponse
func HealthCheckController(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		result := HealthCheckResponse{
			Services: make([]HealthCheckService, 0),
		}

		// api is always healthy
		result.Services = append(result.Services, HealthCheckService{
			Name:    "api",
			Healthy: true,
		})

		// database
		dbHealth := HealthCheckService{
			Name:    "psql",
			Healthy: false,
		}
		if sqlDb, err := db.DB(); err == nil {
			err = sqlDb.Ping()
			if err != nil {
				log.Error("database error: %s", err)
			}
			dbHealth.Healthy = err == nil
		} else {
			log.Error("database error: %s", err)
		}
		result.Services = append(result.Services, dbHealth)

		result.Healthy = true
		for _, service := range result.Services {
			if !service.Healthy {
				result.Healthy = false
				break
			}
		}
		if result.Healthy {
			c.JSON(http.StatusOK, result)
		} else {
			c.JSON(http.StatusServiceUnavailable, result)
		}
	}
}

type BrowseResponseFolder struct {
	Path string `json:"path"`
}

type BrowseResponse struct {
	Path    string                 `json:"path"`
	Parent  string                 `json:"parent"`
	Folders []BrowseResponseFolder `json:"folders"`
}

type BrowseRequest struct {
	Path string `json:"path"`
}

// SystemBrowse
// @Tags System
// @Router /api/system/browse [post]
// @Summary Browse the system storage to find paths
// @Security OAuth2
// @Produce  json
// @Param body body BrowseRequest true "The request"
// @Success 200 {object} BrowseResponse
func SystemBrowse(fs *service.FileSystem) gin.HandlerFunc {
	return func(c *gin.Context) {
		var request BrowseRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			writeError(c, err)
			return
		}
		normalizedPath := request.Path
		folders := make([]string, 0)
		if normalizedPath == "" {
			folders = fs.GetDisks()
		} else {
			if !filepath.IsAbs(normalizedPath) {
				writeJsonError(c, ApiError{
					Status:      http.StatusBadRequest,
					ShortError:  "invalid path",
					Description: "path must be an absolute value",
				})
				return
			}
			if normalizedPath != "/" {
				normalizedPath = filepath.Clean(normalizedPath)
			}
			children, err := ioutil.ReadDir(normalizedPath)
			if err != nil {
				log.Error("failed to get contents of [%s]: %s", request.Path, err)
				c.Status(http.StatusNotFound)
				return
			}
			for _, child := range children {
				if child.IsDir() {
					folders = append(folders, filepath.Join(normalizedPath, child.Name()))
				}
			}
		}

		response := BrowseResponse{
			Path:    normalizedPath,
			Parent:  filepath.Dir(normalizedPath),
			Folders: make([]BrowseResponseFolder, len(folders)),
		}
		for i, folder := range folders {
			response.Folders[i] = BrowseResponseFolder{
				Path: folder,
			}
		}
		c.JSON(http.StatusOK, response)
	}
}
