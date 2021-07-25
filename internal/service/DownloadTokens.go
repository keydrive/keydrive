package service

import (
	"keydrive/internal/model"
	"github.com/google/uuid"
)

type DownloadTokens struct {
	tokens map[string]*model.DownloadToken
}

func NewDownloadTokens() *DownloadTokens {
	return &DownloadTokens{
		tokens: map[string]*model.DownloadToken{},
	}
}

func (t *DownloadTokens) GenerateDownloadToken(library model.Library, path string) *model.DownloadToken {
	token := &model.DownloadToken{
		Token:   uuid.NewString(),
		Library: library,
		Path:    path,
	}

	t.tokens[token.Token] = token
	return token
}

func (t *DownloadTokens) GetDownloadToken(tokenString string) (token *model.DownloadToken, found bool) {
	token, found = t.tokens[tokenString]
	delete(t.tokens, tokenString)
	return
}
