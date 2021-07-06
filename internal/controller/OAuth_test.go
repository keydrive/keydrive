package controller

import (
	"encoding/json"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestToken(t *testing.T) {

	// Go!
	t.Run("it can create a token for valid credentials", func(t *testing.T) {
		req := adminRequest("POST", "/oauth2/token", strings.NewReader(
			"client_id=web&grant_type=password&username=admin&password=admin",
		))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)

		contentType := recorder.Header().Get("Content-Type")
		if contentType != "application/json; charset=utf-8" {
			t.Errorf("Expected text/plain but got: %s", contentType)
		}
		body := map[string]interface{}{}
		_ = json.Unmarshal(recorder.Body.Bytes(), &body)
		if body["access_token"] == nil {
			t.Errorf("Expected to find an access_token instead got: %s", recorder.Body.String())
		}
		status := recorder.Code
		if status != 200 {
			t.Errorf("Expected status 200 but got %d", status)
		}
	})

	t.Run("the username is case insensitive", func(t *testing.T) {
		req := adminRequest("POST", "/oauth2/token", strings.NewReader(
			"client_id=web&grant_type=password&username=AdMiN&password=admin",
		))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)

		contentType := recorder.Header().Get("Content-Type")
		if contentType != "application/json; charset=utf-8" {
			t.Errorf("Expected text/plain but got: %s", contentType)
		}
		body := map[string]interface{}{}
		_ = json.Unmarshal(recorder.Body.Bytes(), &body)
		if body["access_token"] == nil {
			t.Errorf("Expected to find an access_token instead got: %s", recorder.Body.String())
		}
		status := recorder.Code
		if status != 200 {
			t.Errorf("Expected status 200 but got %d", status)
		}
	})

	t.Run("invalid credentials are rejected", func(t *testing.T) {
		req := adminRequest("POST", "/oauth2/token", strings.NewReader(
			"client_id=web&grant_type=password&username=nope&password=nope",
		))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)

		status := recorder.Code
		if status != 400 {
			t.Errorf("Expected status 400 but got %d", status)
		}
	})

	t.Run("the password is case sensitive", func(t *testing.T) {
		req := adminRequest("POST", "/oauth2/token", strings.NewReader(
			"client_id=web&grant_type=password&username=admin&password=ADMIN",
		))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)
		status := recorder.Code
		if status != 400 {
			t.Errorf("Expected status 400 but got %d", status)
		}
	})

	t.Run("client_id is required", func(t *testing.T) {
		req := adminRequest("POST", "/oauth2/token", strings.NewReader(
			"grant_type=password&username=admin&password=admin",
		))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)
		status := recorder.Code
		if status != 400 {
			t.Errorf("Expected status 400 but got %d", status)
		}
	})

	t.Run("grant_type is required", func(t *testing.T) {
		req := adminRequest("POST", "/oauth2/token", strings.NewReader(
			"client_id=web&username=admin&password=admin",
		))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)
		status := recorder.Code
		if status != 400 {
			t.Errorf("Expected status 400 but got %d", status)
		}
	})

	t.Run("username is required", func(t *testing.T) {
		req := adminRequest("POST", "/oauth2/token", strings.NewReader(
			"client_id=web&grant_type=password&password=admin",
		))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)
		status := recorder.Code
		if status != 400 {
			t.Errorf("Expected status 400 but got %d", status)
		}
	})

	t.Run("password is required", func(t *testing.T) {
		req := adminRequest("POST", "/oauth2/token", strings.NewReader(
			"client_id=web&grant_type=password&username=admin",
		))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)
		status := recorder.Code
		if status != 400 {
			t.Errorf("Expected status 400 but got %d", status)
		}
	})

	t.Run("client_id must be web", func(t *testing.T) {
		req := adminRequest("POST", "/oauth2/token", strings.NewReader(
			"client_id=nope&grant_type=password&username=admin&password=admin",
		))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)
		status := recorder.Code
		if status != 401 {
			t.Errorf("Expected status 401 but got %d", status)
		}
	})

	t.Run("grant_type must be password", func(t *testing.T) {
		req := adminRequest("POST", "/oauth2/token", strings.NewReader(
			"client_id=web&grant_type=other&username=admin&password=admin",
		))
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)
		status := recorder.Code
		if status != 400 {
			t.Errorf("Expected status 400 but got %d", status)
		}
	})
}
