package service

import (
	"keydrive/internal/model"
	"context"
	"gorm.io/gorm"
)

type Token struct {
	DB *gorm.DB
}

func (t *Token) CreateToken(user model.User, accessToken string) *model.OAuth2Token {
	token := &model.OAuth2Token{
		AccessToken: accessToken,
		User:        user,
	}

	result := t.DB.Save(&token)
	if result.Error == nil {
		return token
	}
	return nil
}

func (t *Token) GetToken(ctx context.Context, tokenString string) (token model.OAuth2Token, found bool) {
	token.AccessToken = tokenString
	result := t.DB.Model(&model.OAuth2Token{}).Preload("User").Take(&token)
	if result.Error == nil {
		found = true
	}
	return
}
