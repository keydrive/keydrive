package oauth

type contextKey int

const (
	contextKeyClient contextKey = iota
	contextKeyUser
)
