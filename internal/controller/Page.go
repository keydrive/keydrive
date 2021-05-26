package controller

import (
	"gorm.io/gorm"
	"net/http"
	"strconv"
)

type Page struct {
	TotalElements int64       `json:"totalElements"`
	Elements      interface{} `json:"elements"`
}

func toPage(request *http.Request, query *gorm.DB, count *int64, elements interface{}) error {
	qParam := request.URL.Query()
	limit := 20
	limitQuery := qParam.Get("limit")
	if limitQuery != "" {
		if limitValue, err := strconv.Atoi(limitQuery); err == nil && limitValue >= 0 {
			limit = limitValue
		}
	}

	page := 1
	pageQuery := qParam.Get("page")
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
		return result.Error
	}
	result = query.Count(count)
	if result.Error != nil {
		return result.Error
	}
	return nil
}
