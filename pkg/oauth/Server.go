package oauth

type Server struct {
	ClientDetailsService ClientDetailsService
	UserDetailsService   UserDetailsService
	TokenService         TokenService
	PasswordEncoder      PasswordEncoder
}
