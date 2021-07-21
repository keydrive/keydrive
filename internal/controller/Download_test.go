package controller

import (
	"clearcloud/internal/model"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestDownload(t *testing.T) {
	tempDir := t.TempDir()
	_ = os.WriteFile(filepath.Join(tempDir, "gimme.txt"), []byte("Hello World!\n"), 0777)

	lib := model.Library{
		Type:       model.TypeGeneric,
		Name:       "Test Library",
		RootFolder: tempDir,
	}
	testApp.DB.Create(&lib)

	t.Run("it downloads a file", func(t *testing.T) {
		token := testApp.DownloadTokens.GenerateDownloadToken(lib, "/gimme.txt").Token
		req, _ := http.NewRequest("GET", fmt.Sprintf("/api/download?token=%s", token), nil)
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)

		contentType := recorder.Header().Get("Content-Type")
		if contentType != "text/plain" {
			t.Errorf("Expected text/plain but got: %s", contentType)
		}
		disposition := recorder.Header().Get("Content-Disposition")
		if disposition != "attachment; filename=\"gimme.txt\"" {
			t.Errorf("Expected [attachment; filename=\"gimme.txt\"] but got: %s", disposition)
		}
		body := recorder.Body.String()
		if body != "Hello World!\n" {
			t.Errorf("Expected [Hello World!] but got: %s", body)
		}
	})

	t.Run("it returns 404 if file is not found", func(t *testing.T) {
		token := testApp.DownloadTokens.GenerateDownloadToken(lib, "/not/here.txt").Token
		req, _ := http.NewRequest("GET", fmt.Sprintf("/api/download?token=%s", token), nil)
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)
		assertStatus(t, recorder, 404)
	})

	t.Run("it returns 400 if no download token is provided", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/download", nil)
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)
		assertStatus(t, recorder, 400)
	})

	t.Run("it returns 401 if an invalid download token is provided", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/download?token=not_valid", nil)
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)
		assertStatus(t, recorder, 401)
	})
}
