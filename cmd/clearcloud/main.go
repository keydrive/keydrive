package main

import (
	"clearcloud/internal/controller"
	"clearcloud/internal/model"
	"clearcloud/internal/service"
	"clearcloud/pkg/logger"
	"clearcloud/pkg/oauth"
	"flag"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	glog "gorm.io/gorm/logger"
	"net/http"
	"os"
)

var listenAddr = flag.String("listen", ":5555", "The address on which to listen for http requests.")
var postgresDsn = flag.String("postgres-dsn", "host=localhost user=postgres password=postgres dbname=postgres port=5432 sslmode=disable", "The connection string to connect to the postgres database.")
var log = logger.NewConsole(logger.LevelDebug, "MAIN")

func main() {
	flag.Parse()

	log.Info("connecting to database...")
	db, err := gorm.Open(postgres.Open(*postgresDsn), &gorm.Config{
		Logger: glog.New(log, glog.Config{
			LogLevel: glog.Info,
		}),
	})
	if err != nil {
		log.Error("failed to connect to database: %s", err)
		os.Exit(1)
	}
	log.Info("connected")
	log.Info("starting automigration...")

	err = db.AutoMigrate(&model.User{})
	if err != nil {
		log.Error("migration failed: %s", err)
		os.Exit(1)
	}

	log.Info("initializing server...")

	userService := &service.User{}

	oauthServer := &oauth.Server{
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

	authenticated := oauth.RequireAuthentication(oauthServer)
	routes.Handle("/api/users", authenticated(controller.UsersController(db, userService)))

	routes.Handle("/", controller.NotFound())

	log.Info("listening on %s", *listenAddr)
	if err := http.ListenAndServe(*listenAddr, routes); err != http.ErrServerClosed {
		panic(err)
	}
}
