package main

import (
	_ "clearcloud/docs"
	"clearcloud/internal/controller"
	"clearcloud/internal/model"
	"clearcloud/internal/service"
	"clearcloud/pkg/logger"
	"clearcloud/pkg/oauth"
	"errors"
	"flag"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	glog "gorm.io/gorm/logger"
	"net/http"
	"os"
)

var listenAddr = flag.String("listen", ":5555", "The address on which to listen for http requests.")
var postgresDsn = flag.String("postgres-dsn", "host=localhost user=postgres password=postgres dbname=postgres port=5432 sslmode=disable", "The connection string to connect to the postgres database.")
var log = logger.NewConsole(logger.LevelDebug, "MAIN")

// @title ClearCloud API
// @version development

// @contact.name ClearCloud Team
// @contact.url https://github.com/ChappIO/clearcloud/issues
// @contact.email thomas.biesaart@protonmail.com

// @securitydefinitions.oauth2.password OAuth2
// @tokenUrl /oauth2/token
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

	api := router.Group("/api", oauth.Authenticate(oauthServer))
	{
		users := api.Group("/users", oauth.RequireAuthentication())
		{
			users.GET("/", controller.ListUsers(db, userService))
			users.POST("/", controller.RequireAdmin(), controller.CreateUser(db, passwordEncoder))
			users.GET("/:userId", controller.GetUser(db, userService))
			users.PATCH("/:userId", controller.RequireAdmin(), controller.UpdateUser(db, userService, passwordEncoder))
			users.DELETE("/:userId", controller.RequireAdmin(), controller.DeleteUser(db, userService))
		}
	}

	url := ginSwagger.URL("/docs/doc.json")
	router.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, url))

	log.Info("listening on %s", *listenAddr)
	if err := router.Run(*listenAddr); err != http.ErrServerClosed {
		panic(err)
	}
}
