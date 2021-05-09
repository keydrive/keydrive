package oauth

import (
	"context"
)

type TokenService interface {
	CreateToken(ctx context.Context, token string) Token
	GetToken(ctx context.Context, token string)
}

type Token interface {
	GetAccessToken() string
	GetClient() ClientDetails
	GetUser() UserDetails
}
