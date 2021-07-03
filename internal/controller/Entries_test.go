package controller

import (
	"clearcloud/internal/model"
	"fmt"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestDownloadEntry(t *testing.T) {
	// Prep filesystem\
	tempDir := t.TempDir()
	_ = os.WriteFile(filepath.Join(tempDir, "gimme.txt"), []byte("Hello World!\n"), 0777)

	lib := model.Library{
		Type:       model.TypeGeneric,
		Name:       "Test Library",
		RootFolder: tempDir,
	}
	testApp.DB.Create(&lib)

	// Go!
	t.Run("it downloads a file", func(t *testing.T) {
		req := adminRequest("GET", fmt.Sprintf("/api/libraries/%d/entries/gimme.txt/download", lib.ID), nil)
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

	t.Run("it returns 404 if file not found", func(t *testing.T) {
		req := adminRequest("GET", fmt.Sprintf("/api/libraries/%d/entries/nope.txt/download", lib.ID), nil)
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)
		status := recorder.Code
		if status != 404 {
			t.Errorf("Expected 404 but got: %d", status)
		}
	})

	t.Run("it returns 404 if no access to library", func(t *testing.T) {
		req := noAccessUserRequest("GET", fmt.Sprintf("/api/libraries/%d/entries/gimme.txt/download", lib.ID), nil)
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)
		status := recorder.Code
		if status != 404 {
			t.Errorf("Expected 404 but got: %d", status)
		}
	})

	t.Run("it returns 400 if no path provided", func(t *testing.T) {
		req := adminRequest("GET", fmt.Sprintf("/api/libraries/%d/entries//download", lib.ID), nil)
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)
		status := recorder.Code
		if status != 400 {
			t.Errorf("Expected 400 but got: %d", status)
		}
	})

	t.Run("it returns 404 if no libraryId provided", func(t *testing.T) {

	})

	t.Run("it returns 400 if path not encoded", func(t *testing.T) {
		req := adminRequest("GET", "/simple", nil)
		req.URL.Path = fmt.Sprintf("/api/libraries/%d/entries/what is this sh%%it!/download", lib.ID)
		recorder := httptest.NewRecorder()
		testApp.Router.ServeHTTP(
			recorder,
			req,
		)
		status := recorder.Code
		if status != 400 {
			t.Errorf("Expected 400 but got: %d", status)
		}
	})
}
