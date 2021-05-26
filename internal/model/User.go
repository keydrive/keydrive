package model

import (
	"clearcloud/pkg/oauth"
	"context"
	"strings"
)

type User struct {
	ID             int    `json:"id"`
	Username       string `json:"username" gorm:"not null;unique;type:citext"`
	FirstName      string `json:"firstName" gorm:"not null"`
	LastName       string `json:"lastName" gorm:"not null"`
	HashedPassword string `json:"-" gorm:"not null"`
}

func (u User) GetUsername() string {
	return u.Username
}

func (u User) GetHashedPassword() string {
	return u.HashedPassword
}

type UserDetailsService struct {
	HardcodedUser User
}

func (u *UserDetailsService) GetUser(ctx context.Context, username string) oauth.UserDetails {
	if strings.ToLower(username) == strings.ToLower(u.HardcodedUser.Username) {
		return u.HardcodedUser
	}
	return nil
}
