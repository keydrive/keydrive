package model

import (
	"clearcloud/pkg/oauth"
	"context"
)

type OAuth2Token struct {
	AccessToken string `gorm:"primaryKey"`
	UserID      int    `gorm:"not null"`
	User        User
}

func (t *OAuth2Token) GetAccessToken() string {
	return t.AccessToken
}

func (t *OAuth2Token) GetUser() oauth.UserDetails {
	return t.User
}

func (t *OAuth2Token) GetClient() oauth.ClientDetails {
	return &Client{ID: "web"}
}

type TokenService struct {
	Tokens map[string]*OAuth2Token
}

func (t *TokenService) CreateToken(ctx context.Context, accessToken string) oauth.Token {
	token := &OAuth2Token{
		AccessToken: accessToken,
		User:        oauth.GetUser(ctx).(User),
	}
	t.Tokens[accessToken] = token
	return token
}

func (t *TokenService) GetToken(ctx context.Context, token string) oauth.Token {
	return t.Tokens[token]
}
