package main

import (
	"clearcloud/internal/model"
	"clearcloud/pkg/logger"
	"clearcloud/pkg/oauth"
	"flag"
	"net/http"
)

var listenAddr = flag.String("listen", ":5555", "The address on which to listen for http requests.")
var log = logger.NewConsole(logger.LevelDebug, "MAIN")

func main() {
	flag.Parse()
	log.Info("initializing server...")

	oauthServer := oauth.Server{
		PasswordEncoder:      &oauth.BcryptEncoder{},
		ClientDetailsService: &model.ClientDetailsService{},
		UserDetailsService: &model.UserDetailsService{HardcodedUser: model.User{
			FirstName:      "Super",
			LastName:       "Admin",
			Username:       "admin",
			HashedPassword: "$2y$12$3fvGYrtMSKiow6gvb.K0Q.c4AMhItCQcv5MU7pYNypZii/R.li2o2",
		}},
		TokenService: &model.TokenService{
			Tokens: make(map[string]*model.OAuth2Token),
		},
	}

	routes := http.NewServeMux()
	routes.Handle("/oauth2/token", oauthServer.TokenEndpoint())

	log.Info("listening on %s", *listenAddr)
	if err := http.ListenAndServe(*listenAddr, routes); err != http.ErrServerClosed {
		panic(err)
	}
}
