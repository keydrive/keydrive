package service

import (
	"clearcloud/internal/model"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DownloadToken struct {
	DB *gorm.DB
}

func (t *DownloadToken) GenerateDownloadToken(library model.Library, path string) *model.DownloadToken {
	token := &model.DownloadToken{
		Token:   uuid.NewString(),
		Library: library,
		Path:    path,
	}

	result := t.DB.Create(&token)
	if result.Error == nil {
		return token
	}
	return nil
}

func (t *DownloadToken) GetDownloadToken(tokenString string) (token model.DownloadToken, found bool) {
	token.Token = tokenString
	result := t.DB.Model(&model.DownloadToken{}).Preload("Library").Take(&token)
	if result.Error == nil {
		found = true
	}
	return
}
