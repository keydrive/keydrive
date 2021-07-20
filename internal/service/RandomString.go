package service

import (
	"crypto/rand"
	"encoding/hex"
)

func RandomString(length int) string {
	b := make([]byte, length)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
