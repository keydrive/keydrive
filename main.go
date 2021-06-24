package main

import (
	_ "clearcloud/docs"
	"clearcloud/internal/controller"
	"clearcloud/internal/model"
	"clearcloud/internal/service"
	"clearcloud/pkg/logger"
	"clearcloud/pkg/oauth"
	"clearcloud/web/build"
	"errors"
	"flag"
	"fmt"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	glog "gorm.io/gorm/logger"
	"net/http"
	"os"
	"strconv"
	"strings"
)

func stringOpt(name string, value string, description string) *string {
	if envValue, ok := os.LookupEnv(strings.ToUpper(strings.ReplaceAll(name, "-", "_"))); ok {
		value = envValue
	}
	return flag.String(name, value, description)
}

func intOpt(name string, value int, description string) *int {
	if envValue, ok := os.LookupEnv(strings.ToUpper(strings.ReplaceAll(name, "-", "_"))); ok {
		if intVal, err := strconv.Atoi(envValue); err != nil {
			value = intVal
		}
	}
	return flag.Int(name, value, description)
}

var listenAddr = stringOpt("listen", ":5555", "The address on which to listen for http requests.")
var postgresHost = stringOpt("postgres-host", "localhost", "The psql host")
var postgresUser = stringOpt("postgres-user", "postgres", "The psql username")
var postgresPassword = stringOpt("postgres-password", "postgres", "The psql password")
var postgresDb = stringOpt("postgres-db", "postgres", "The psql database name")
var postgresPort = intOpt("postgres-port", 5432, "The psql host port")
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
	postgresDsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%d sslmode=disable",
		*postgresHost,
		*postgresUser,
		*postgresPassword,
		*postgresDb,
		*postgresPort,
	)
	db, err := gorm.Open(postgres.Open(postgresDsn), &gorm.Config{
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
	err = db.AutoMigrate(&model.User{}, &model.OAuth2Token{}, &model.Library{}, &model.CanAccessLibrary{})
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
	libraryService := &service.Library{}
	tokenService := &service.Token{
		DB: db,
	}
	fileSystemService := &service.FileSystem{}
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
		user := api.Group("/user", oauth.RequireAuthentication())
		{
			user.GET("/", controller.GetAuthenticatedUser())
			user.PATCH("/", controller.UpdateAuthenticatedUser(db, passwordEncoder))
		}
		users := api.Group("/users", oauth.RequireAuthentication())
		{
			users.GET("/", controller.ListUsers(db, userService))
			users.POST("/", controller.RequireAdmin(), controller.CreateUser(db, passwordEncoder))
			users.GET("/:userId", controller.GetUser(db, userService))
			users.PATCH("/:userId", controller.RequireAdmin(), controller.UpdateUser(db, userService, passwordEncoder))
			users.DELETE("/:userId", controller.RequireAdmin(), controller.DeleteUser(db, userService))
		}
		libraries := api.Group("/libraries", oauth.RequireAuthentication())
		{
			libraries.GET("/", controller.ListLibraries(db, libraryService))
			libraries.POST("/", controller.RequireAdmin(), controller.CreateLibrary(db))
			libraries.GET("/:libraryId", controller.RequireAdmin(), controller.GetLibrary(db, libraryService))
			libraries.PATCH("/:libraryId", controller.RequireAdmin(), controller.UpdateLibrary(db, libraryService))
			libraries.DELETE("/:libraryId", controller.RequireAdmin(), controller.DeleteLibrary(db, libraryService))
			libraries.POST("/:libraryId/shares", controller.RequireAdmin(), controller.ShareLibrary(db, libraryService, userService))
			libraries.DELETE("/:libraryId/shares/:userId", controller.RequireAdmin(), controller.UnshareLibrary(db))

			entries := libraries.Group("/:libraryId/entries")
			{
				entries.GET("", controller.ListEntries(db, libraryService, fileSystemService))
				entries.POST("", controller.CreateEntry(db, libraryService, fileSystemService))
				entries.GET("/:path", controller.GetEntry(db, libraryService, fileSystemService))
				entries.DELETE("/:path", controller.DeleteEntry(db, libraryService, fileSystemService))
			}
		}
		system := api.Group("/system")
		{
			system.GET("/health", controller.HealthCheckController(db))
			system.POST("/browse", controller.RequireAdmin(), controller.SystemBrowse(fileSystemService))
		}
	}
	router.NoRoute(controller.Static(http.FS(build.App)))

	url := ginSwagger.URL("/docs/doc.json")
	router.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, url))

	log.Info("listening on %s", *listenAddr)
	if err := router.Run(*listenAddr); err != http.ErrServerClosed {
		panic(err)
	}
}
