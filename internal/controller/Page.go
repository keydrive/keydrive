package controller

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"strconv"
)

type Page struct {
	TotalElements int64       `json:"totalElements"`
	Elements      interface{} `json:"elements"`
}

func returnPage(c *gin.Context, query *gorm.DB, body interface{}, count *int64, elements interface{}) {
	limit := 20
	limitQuery := c.DefaultQuery("limit", "20")
	if limitQuery != "" {
		if limitValue, err := strconv.Atoi(limitQuery); err == nil && limitValue >= 0 {
			limit = limitValue
		}
	}

	page := 1
	pageQuery := c.DefaultQuery("page", "1")
	if pageQuery != "" {
		if pageValue, err := strconv.Atoi(pageQuery); err == nil && pageValue >= 0 {
			page = pageValue
		}
	}

	if limit > 100 {
		limit = 100
	}

	result := query.Offset((page - 1) * limit).Limit(limit).Find(elements)
	if result.Error != nil {
		log.Warn("failed to build page: %s", result.Error)
		c.JSON(http.StatusInternalServerError, nil)
		return
	}
	result = query.Count(count)
	if result.Error != nil {
		log.Warn("failed to build page: %s", result.Error)
		c.JSON(http.StatusInternalServerError, nil)
		return
	}
	c.JSON(http.StatusOK, body)
}
