package controller

import (
	"fmt"
	"keydrive/internal/model"
	"net/http/httptest"
	"testing"
)

func TestGetLibrary(t *testing.T) {
	lib := model.Library{
		Type:       model.TypeGeneric,
		Name:       "Test Library",
		RootFolder: "/",
	}
	testApp.DB.Create(&lib)
	readAccess := model.CanAccessLibrary{
		User:     regularUser,
		Library:  lib,
		CanWrite: true,
	}
	testApp.DB.Create(&readAccess)

	t.Run("requires admin access", func(t *testing.T) {
		req := regularUserRequest("GET", fmt.Sprintf("/api/libraries/%d", lib.ID), nil)
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)

		assertStatus(t, recorder, 403)
	})

	t.Run("returns shares", func(t *testing.T) {
		req := adminRequest("GET", fmt.Sprintf("/api/libraries/%d", lib.ID), nil)
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)

		assertStatus(t, recorder, 200)
		body := map[string]interface{}{}
		assertJsonUnmarshal(t, recorder, &body)
		if body["sharedWith"].([]interface{})[0].(map[string]interface{})["username"] == "simple-access" {
			t.Errorf("Expected a share but instead got: %s", recorder.Body.String())
		}
	})
}
