package service

import (
	"clearcloud/internal/model"
	"clearcloud/pkg/oauth"
	"context"
	"gorm.io/gorm"
)

type Token struct {
	DB *gorm.DB
}

func (t *Token) CreateToken(ctx context.Context, accessToken string) oauth.Token {
	token := &model.OAuth2Token{
		AccessToken: accessToken,
		User:        oauth.GetUser(ctx).(model.User),
	}

	result := t.DB.Save(&token)
	if result.Error == nil {
		return token
	}
	return nil
}

func (t *Token) GetToken(ctx context.Context, tokenString string) oauth.Token {
	var token model.OAuth2Token
	token.AccessToken = tokenString
	result := t.DB.Model(&model.OAuth2Token{}).Preload("User").Take(&token)
	if result.Error == nil {
		return token
	}
	return nil
}
