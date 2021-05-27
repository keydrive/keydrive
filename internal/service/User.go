package service

import (
	"clearcloud/internal/model"
	"clearcloud/pkg/oauth"
	"context"
	"gorm.io/gorm"
)

type User struct {
	DB *gorm.DB
}

func (s *User) GetUser(ctx context.Context, username string) oauth.UserDetails {
	var user model.User
	user.Username = username
	result := s.GetUsers(s.DB).Where(&user).Take(&user)
	if result.Error == nil {
		return user
	} else {
		return nil
	}
}

func (s *User) GetUsers(tx *gorm.DB) *gorm.DB {
	return tx.Model(&model.User{})
}
