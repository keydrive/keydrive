package model

import (
	"clearcloud/pkg/oauth"
	"context"
	"strings"
)

type User struct {
	FirstName      string
	LastName       string
	Username       string
	HashedPassword string
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
