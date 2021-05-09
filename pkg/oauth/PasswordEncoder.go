package oauth

import (
	"golang.org/x/crypto/bcrypt"
)

type PasswordEncoder interface {
	Encode(plain string) string
	Compare(plain string, hash string) bool
}

type BcryptEncoder struct {
	Strength int
}

func (e *BcryptEncoder) Encode(plain string) string {
	hash, err := bcrypt.GenerateFromPassword([]byte(plain), e.Strength)
	if err != nil {
		log.Error("failed to hash a password! %s", err)
	}
	return string(hash)
}

func (e *BcryptEncoder) Compare(plain string, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain))
	return err == nil
}
