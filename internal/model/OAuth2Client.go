package model

import (
	"context"
)

type Client struct {
	ID string
}

func (c *Client) GetID() string {
	return c.ID
}

type ClientDetailsService struct {
}

func (c *ClientDetailsService) GetClient(ctx context.Context, clientId string) *Client {
	if clientId == "web" {
		return &Client{
			ID: "web",
		}
	} else {
		return nil
	}
}
