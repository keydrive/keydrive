package controller

import (
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
		assertJsonUnmarshal(t, recorder, &body)
		if body["access_token"] == nil {
			t.Errorf("Expected to find an access_token instead got: %s", recorder.Body.String())
		}
		assertStatus(t, recorder, 200)
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
		assertJsonUnmarshal(t, recorder, &body)
		if body["access_token"] == nil {
			t.Errorf("Expected to find an access_token instead got: %s", recorder.Body.String())
		}
		assertStatus(t, recorder, 200)
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

		assertStatus(t, recorder, 400)
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
		assertStatus(t, recorder, 400)
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
		assertStatus(t, recorder, 400)
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
		assertStatus(t, recorder, 400)
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
		assertStatus(t, recorder, 400)
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
		assertStatus(t, recorder, 400)
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
		assertStatus(t, recorder, 401)
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
		assertStatus(t, recorder, 400)
	})
}
