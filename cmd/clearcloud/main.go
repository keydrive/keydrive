package main

import (
	"clearcloud/internal/model"
	"clearcloud/internal/service"
	"clearcloud/pkg/logger"
	"clearcloud/pkg/oauth"
	"errors"
	"flag"
	"github.com/gin-gonic/gin"
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

	db.Exec("CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public")
	err = db.AutoMigrate(&model.User{}, &model.OAuth2Token{})
	if err != nil {
		log.Error("migration failed: %s", err)
		os.Exit(1)
	}

	log.Info("preloading admin user...")
	var admin model.User
	result := db.Model(&model.User{}).Take(&admin, 1)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		log.Info("username: admin")
		log.Info("password: admin")
		db.Save(&model.User{
			ID:             1,
			FirstName:      "Super",
			LastName:       "Admin",
			Username:       "admin",
			HashedPassword: "$2y$12$3fvGYrtMSKiow6gvb.K0Q.c4AMhItCQcv5MU7pYNypZii/R.li2o2",
		})
		db.Exec("SELECT setval('users_id_seq', 500, true)")
	} else {
		log.Info("admin account already exists")
	}

	log.Info("initializing server...")

	userService := &service.User{
		DB: db,
	}
	tokenService := &service.Token{
		DB: db,
	}
	passwordEncoder := &oauth.BcryptEncoder{}
	oauthServer := &oauth.Server{
		PasswordEncoder:      passwordEncoder,
		ClientDetailsService: &model.ClientDetailsService{},
		UserDetailsService:   userService,
		TokenService:         tokenService,
	}

	router := gin.Default()
	oauth2 := router.Group("/oauth2")
	{
		oauth2.POST("/token", oauthServer.TokenEndpoint())
	}

	//authenticated := oauth.RequireAuthentication(oauthServer)
	//routes.Handle("/api/users", authenticated(controller.UsersCollection(db, userService, passwordEncoder)))
	//routes.Handle("/api/users/", authenticated(controller.UserResource(db, userService, passwordEncoder)))
	//
	//routes.Handle("/", controller.NotFound())

	log.Info("listening on %s", *listenAddr)
	if err := router.Run(*listenAddr); err != http.ErrServerClosed {
		panic(err)
	}
}
