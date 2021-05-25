package controller

import "gorm.io/gorm"

type Page struct {
	TotalElements int64       `json:"totalElements"`
	Elements      interface{} `json:"elements"`
}

func toPage(query *gorm.DB, count *int64, elements interface{}) error {
	result := query.Find(elements)
	if result.Error != nil {
		return result.Error
	}
	result = query.Count(count)
	if result.Error != nil {
		return result.Error
	}
	return nil
}
