package controller

import (
	"database/sql"
	"fmt"
	_ "github.com/jackc/pgx/v4/stdlib"
	"gorm.io/driver/postgres"
	"math/rand"
	"os"
	"testing"
	"time"
)

func init() {
	rand.Seed(time.Now().UnixNano())
}

var letters = []rune("abcdefghijklmnopqrstuvwxyz")

func randomString(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func lookupEnv(variable string, defaultValue string) string {
	if value, ok := os.LookupEnv(variable); ok {
		return value
	} else {
		return defaultValue
	}
}

func createTestContext() App {
	adminPSQL := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%d sslmode=disable",
		lookupEnv("POSTGRES_HOST", "localhost"),
		lookupEnv("POSTGRES_USER", "postgres"),
		lookupEnv("POSTGRES_PASSWORD", "postgres"),
		lookupEnv("POSTGRES_DB", "postgres"),
		5432,
	)
	adminDb, err := sql.Open("pgx", adminPSQL)
	if err != nil {
		panic(err)
	}

	testDbName := fmt.Sprintf("gotest_%s", randomString(14))
	_, err = adminDb.Exec("CREATE DATABASE " + testDbName)
	if err != nil {
		panic(err)
	}
	adminDb.Close()

	testPSQL := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%d sslmode=disable",
		lookupEnv("POSTGRES_HOST", "localhost"),
		lookupEnv("POSTGRES_USER", "postgres"),
		lookupEnv("POSTGRES_PASSWORD", "postgres"),
		testDbName,
		5432,
	)
	testDiag := postgres.Open(testPSQL)
	app, err := NewApp(testDiag)
	if err != nil {
		panic(err)
	}
	originalClose := app.Close
	app.Close = func() {
		originalClose()
		testDb, err := app.DB.DB()
		if err != nil {
			panic(err)
		}
		testDb.Close()

		adminDb, err := sql.Open("pgx", adminPSQL)
		if err != nil {
			panic(err)
		}
		_, err = adminDb.Exec("DROP DATABASE " + testDbName)
		if err != nil {
			panic(err)
		}
	}

	return app
}

var testApp App

func TestMain(m *testing.M) {
	testApp = createTestContext()
	defer testApp.Close()
	m.Run()
}
