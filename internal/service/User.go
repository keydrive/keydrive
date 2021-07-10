package service

import (
	"clearcloud/internal/model"
	"gorm.io/gorm"
)

type User struct {
	DB *gorm.DB
}

func (s *User) GetUser(username string) (user model.User, found bool) {
	user.Username = username
	result := s.GetUsers(s.DB).Where(&user).Take(&user)
	if result.Error == nil {
		found = true
	}
	return
}

func (s *User) GetUsers(tx *gorm.DB) *gorm.DB {
	return tx.Model(&model.User{})
}
