package main

import (
	_ "clearcloud/docs"
	"clearcloud/internal/controller"
	"clearcloud/pkg/logger"
	"flag"
	"fmt"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/driver/postgres"
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

	webApp, err := controller.NewApp(postgres.Open(postgresDsn))
	if err != nil {
		os.Exit(1)
	}
	defer webApp.Close()

	url := ginSwagger.URL("/docs/doc.json")
	webApp.Router.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, url))

	log.Info("listening on %s", *listenAddr)
	if err := webApp.Router.Run(*listenAddr); err != http.ErrServerClosed {
		panic(err)
	}
}
