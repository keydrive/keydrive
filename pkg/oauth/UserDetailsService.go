package oauth

import "context"

type UserDetailsService interface {
	GetUser(ctx context.Context, username string) UserDetails
}

type UserDetails interface {
	GetUsername() string
	GetHashedPassword() string
}

type BasicUser struct {
	Username       string
	HashedPassword string
}

func (u *BasicUser) GetUsername() string {
	return u.Username
}

func (u *BasicUser) GetHashedPassword() string {
	return u.HashedPassword
}

func GetUser(ctx context.Context) UserDetails {
	result := ctx.Value(contextKeyUser)
	if result == nil {
		return nil
	}
	return result.(UserDetails)
}
