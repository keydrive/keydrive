package model

import (
	"clearcloud/pkg/oauth"
)

type OAuth2Token struct {
	AccessToken string `gorm:"primaryKey;type:uuid"`
	UserID      int    `gorm:"not null;constraint:OnDelete:CASCADE"`
	User        User   `gorm:"not null;constraint:OnDelete:CASCADE"`
}

func (t OAuth2Token) GetAccessToken() string {
	return t.AccessToken
}

func (t OAuth2Token) GetUser() oauth.UserDetails {
	return t.User
}

func (t OAuth2Token) GetClient() oauth.ClientDetails {
	return &Client{ID: "web"}
}
