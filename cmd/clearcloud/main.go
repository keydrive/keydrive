package main

import (
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
		ClientDetailsService: nil,
		UserDetailsService:   nil,
	}

	routes := http.NewServeMux()
	routes.Handle("/oauth2/token", oauthServer.TokenEndpoint())

	log.Info("listening on %s", *listenAddr)
	if err := http.ListenAndServe(*listenAddr, routes); err != http.ErrServerClosed {
		panic(err)
	}
}
