package oauth

import "context"

type ClientDetailsService interface {
	GetClient(ctx context.Context, clientId string) ClientDetails
}

type ClientDetails interface {
	GetID() string
}

func GetClient(ctx context.Context) ClientDetails {
	result := ctx.Value(contextKeyClient)
	if result == nil {
		return nil
	}
	return result.(ClientDetails)
}
