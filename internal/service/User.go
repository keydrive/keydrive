package service

import (
	"clearcloud/internal/model"
	"gorm.io/gorm"
)

type User struct {
}

func (s *User) GetUsers(tx *gorm.DB) *gorm.DB {
	return tx.Model(&model.User{})
}
