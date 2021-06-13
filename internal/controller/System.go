package controller

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
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
// @Router /system/health [get]
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
		result.Services = append(result.Services, dbHealth)
		if sqlDb, err := db.DB(); err == nil {
			err = sqlDb.Ping()
			if err != nil {
				log.Error("database error: %s", err)
			}
			dbHealth.Healthy = err == nil
		} else {
			log.Error("database error: %s", err)
		}

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
