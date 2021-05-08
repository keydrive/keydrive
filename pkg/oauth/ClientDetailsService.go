package oauth

import "context"

type ClientDetailsService interface {
	GetClient(ctx context.Context, clientId string) ClientDetails
}

type ClientDetails interface {
	GetID() string
	GetHashedSecret() string
}

type BasicClient struct {
	ID           string
	HashedSecret string
}

func (c *BasicClient) GetID() string {
	return c.ID
}

func (c *BasicClient) GetHashedSecret() string {
	return c.HashedSecret
}

func GetClient(ctx context.Context) ClientDetails {
	result := ctx.Value(contextKeyClient)
	if result == nil {
		return nil
	}
	return result.(ClientDetails)
}
