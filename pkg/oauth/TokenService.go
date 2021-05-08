package oauth

import "context"

type TokenService interface {
	CreateToken(ctx context.Context, token string)
	GetToken(ctx context.Context, token string)
}

type Token interface {
	GetAccessToken() string
	GetRefreshToken() string
}
