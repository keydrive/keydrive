package service

import (
	"golang.org/x/crypto/bcrypt"
)

type BcryptEncoder struct {
	Strength int
}

func (e *BcryptEncoder) Encode(plain string) string {
	hash, _ := bcrypt.GenerateFromPassword([]byte(plain), e.Strength)
	return string(hash)
}

func (e *BcryptEncoder) Compare(plain string, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain))
	return err == nil
}
