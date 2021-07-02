package controller

import (
	"clearcloud/internal/model"
	"clearcloud/internal/service"
	"clearcloud/pkg/oauth"
	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestDownloadEntry(t *testing.T) {
	// Prep filesystem\
	tempDir := t.TempDir()
	_ = os.WriteFile(filepath.Join(tempDir, "gimme.txt"), []byte("Hello World!\n"), 0777)

	// Mock database
	mockDb, mock, _ := sqlmock.New()
	defer mockDb.Close()
	db, err := gorm.Open(postgres.New(postgres.Config{
		Conn: mockDb,
	}))
	if err != nil {
		t.Fatalf("Failed to start mock connection %s", err)
	}

	// Set up context
	libs := &service.Library{}
	fs := &service.FileSystem{}

	controller := DownloadEntry(db, libs, fs)

	setup := func() {
		mock.
			ExpectQuery("SELECT .* FROM \"libraries\" left join can_access_libraries on can_access_libraries.library_id = libraries.id WHERE .* ORDER BY id LIMIT 1").
			WithArgs(675, 387).
			WillReturnRows(sqlmock.NewRows([]string{"id", "type", "name", "root_folder", "can_write"}).AddRow(12, model.TypeGeneric, "Test Library", tempDir, true)).
			RowsWillBeClosed()
	}

	// Go!
	t.Run("it download a file", func(t *testing.T) {
		setup()
		recorder := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(recorder)
		c.Params = []gin.Param{
			{
				Key:   "libraryId",
				Value: "387",
			},
			{
				Key:   "path",
				Value: "gimme.txt",
			},
		}
		c.Set(oauth.ContextKeyUser, model.User{
			ID: 675,
		})

		controller(c)

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
		setup()

		recorder := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(recorder)
		c.Params = []gin.Param{
			{
				Key:   "libraryId",
				Value: "387",
			},
			{
				Key:   "path",
				Value: "nopenopenop.txt",
			},
		}
		c.Set(oauth.ContextKeyUser, model.User{
			ID: 675,
		})

		controller(c)

		if recorder.Code != 404 {
			t.Errorf("Expected a 404 error but got %d instead", recorder.Code)
		}
	})

	t.Run("it returns 404 if no access to library", func(t *testing.T) {
		setup()

		recorder := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(recorder)
		c.Params = []gin.Param{
			{
				Key:   "libraryId",
				Value: "23042",
			},
			{
				Key:   "path",
				Value: "gimme.txt",
			},
		}
		c.Set(oauth.ContextKeyUser, model.User{
			ID: 675,
		})

		controller(c)

		if recorder.Code != 404 {
			t.Errorf("Expected a 404 error but got %d instead", recorder.Code)
		}
	})

	t.Run("it returns 400 if no path provided", func(t *testing.T) {
		setup()

		recorder := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(recorder)
		c.Params = []gin.Param{
			{
				Key:   "libraryId",
				Value: "387",
			},
		}
		c.Set(oauth.ContextKeyUser, model.User{
			ID: 675,
		})

		controller(c)

		if recorder.Code != 400 {
			t.Errorf("Expected a 400 error but got %d instead", recorder.Code)
		}
	})

	t.Run("it returns 404 if no libraryId provided", func(t *testing.T) {
		setup()

		recorder := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(recorder)
		c.Params = []gin.Param{
			{
				Key:   "path",
				Value: "gimme.txt",
			},
		}
		c.Set(oauth.ContextKeyUser, model.User{
			ID: 675,
		})

		controller(c)

		if recorder.Code != 404 {
			t.Errorf("Expected a 404 error but got %d instead", recorder.Code)
		}
	})

	t.Run("it returns 400 if path not encoded", func(t *testing.T) {
		setup()

		recorder := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(recorder)
		c.Params = []gin.Param{
			{
				Key:   "libraryId",
				Value: "387",
			},
			{
				Key:   "path",
				Value: "wtf is this sh%t?",
			},
		}
		c.Set(oauth.ContextKeyUser, model.User{
			ID: 675,
		})

		controller(c)

		if recorder.Code != 400 {
			t.Errorf("Expected a 400 error but got %d instead", recorder.Code)
		}
	})
}
