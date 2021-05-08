package oauth

import "net/http"

type Server struct {
	ClientDetailsService ClientDetailsService
	UserDetailsService   UserDetailsService
}

func (s *Server) TokenEndpoint() http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		writer.Write([]byte("Sup??"))
	})
}
