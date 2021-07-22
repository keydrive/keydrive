package controller

import (
	"clearcloud/internal/model"
	"clearcloud/internal/service"
	"clearcloud/web/build"
	"errors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	glog "gorm.io/gorm/logger"
	"net/http"
	"os"
)

type App struct {
	Router          *gin.Engine
	DB              *gorm.DB
	Users           *service.User
	Libraries       *service.Library
	Tokens          *service.Token
	FileSystem      *service.FileSystem
	PasswordEncoder *service.BcryptEncoder
	DownloadTokens  *service.DownloadTokens
	Clients         *model.ClientDetailsService
	Close           func()
}

func NewApp(dbDiag gorm.Dialector) (app App, err error) {
	app.DB, err = gorm.Open(dbDiag, &gorm.Config{
		Logger: glog.New(log, glog.Config{
			LogLevel: glog.Info,
		}),
	})

	if err != nil {
		log.Error("failed to connect to database: %s", err)
		return
	}

	log.Info("connected")
	log.Info("starting automigration...")

	app.DB.Exec("CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public")
	err = app.DB.AutoMigrate(&model.User{}, &model.OAuth2Token{}, &model.Library{}, &model.CanAccessLibrary{})
	if err != nil {
		log.Error("migration failed: %s", err)
		os.Exit(1)
	}

	log.Info("preloading admin user...")
	var admin model.User
	result := app.DB.Model(&model.User{}).Take(&admin, 1)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		log.Info("username: admin")
		log.Info("password: admin")
		app.DB.Save(&model.User{
			ID:             1,
			FirstName:      "Super",
			LastName:       "Admin",
			Username:       "admin",
			HashedPassword: "$2y$12$3fvGYrtMSKiow6gvb.K0Q.c4AMhItCQcv5MU7pYNypZii/R.li2o2",
		})
		app.DB.Exec("SELECT setval('users_id_seq', 500, true)")
	} else {
		log.Info("admin account already exists")
	}

	log.Info("initializing server...")

	app.Users = &service.User{
		DB: app.DB,
	}
	app.Libraries = &service.Library{}
	app.Tokens = &service.Token{
		DB: app.DB,
	}
	app.FileSystem = &service.FileSystem{}
	app.PasswordEncoder = &service.BcryptEncoder{}
	app.DownloadTokens = service.NewDownloadTokens()
	app.Clients = &model.ClientDetailsService{}

	app.Router = gin.Default()
	oauth2 := app.Router.Group("/oauth2")
	{
		oauth2.POST("/token", Token(app.Users, app.Clients, app.Tokens, app.PasswordEncoder))
	}

	api := app.Router.Group("/api", Authenticate(app.Tokens))
	{
		user := api.Group("/user", RequireAuthentication())
		{
			user.GET("/", GetAuthenticatedUserInfo())
			user.PATCH("/", UpdateAuthenticatedUser(app.DB, app.PasswordEncoder))
		}
		users := api.Group("/users", RequireAuthentication())
		{
			users.GET("/", ListUsers(app.DB, app.Users))
			users.POST("/", RequireAdmin(), CreateUser(app.DB, app.PasswordEncoder))
			users.GET("/:userId", GetUser(app.DB, app.Users))
			users.PATCH("/:userId", RequireAdmin(), UpdateUser(app.DB, app.Users, app.PasswordEncoder))
			users.DELETE("/:userId", RequireAdmin(), DeleteUser(app.DB, app.Users))
		}
		libraries := api.Group("/libraries", RequireAuthentication())
		{
			libraries.GET("/", ListLibraries(app.DB, app.Libraries))
			libraries.POST("/", RequireAdmin(), CreateLibrary(app.DB))
			libraries.GET("/:libraryId", RequireAdmin(), GetLibrary(app.DB, app.Libraries))
			libraries.PATCH("/:libraryId", RequireAdmin(), UpdateLibrary(app.DB, app.Libraries))
			libraries.DELETE("/:libraryId", RequireAdmin(), DeleteLibrary(app.DB, app.Libraries))
			libraries.POST("/:libraryId/shares", RequireAdmin(), ShareLibrary(app.DB, app.Libraries, app.Users))
			libraries.DELETE("/:libraryId/shares/:userId", RequireAdmin(), UnshareLibrary(app.DB))

			entries := libraries.Group("/:libraryId/entries")
			{
				entries.GET("", ListEntries(app.DB, app.Libraries, app.FileSystem))
				entries.POST("", CreateEntry(app.DB, app.Libraries, app.FileSystem))
				entries.POST("/download", CreateDownloadToken(app.DB, app.Libraries, app.DownloadTokens))
				entries.DELETE("", DeleteEntry(app.DB, app.Libraries, app.FileSystem))
			}
		}
		download := api.Group("/download", RequireDownloadToken(app.DownloadTokens))
		{
			download.GET("", Download(app.FileSystem))
		}
		system := api.Group("/system")
		{
			system.GET("/health", HealthCheckController(app.DB))
			system.POST("/browse", RequireAdmin(), SystemBrowse(app.FileSystem))
		}
	}
	app.Router.NoRoute(Static(http.FS(build.App)))

	app.Close = func() {
		// Nothing to do by default
	}
	return
}
