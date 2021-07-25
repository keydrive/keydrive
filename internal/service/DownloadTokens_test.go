package service

import (
	"keydrive/internal/model"
	"testing"
)

func TestDownloadTokens(t *testing.T) {
	tokens := NewDownloadTokens()
	lib := model.Library{
		ID:         1,
		Type:       "generic",
		Name:       "Test Library",
		RootFolder: "/tmp/test",
	}

	t.Run("it returns a token with the correct information", func(t *testing.T) {
		tokenId := tokens.GenerateDownloadToken(lib, "/download/path").Token

		tokenValue, found := tokens.GetDownloadToken(tokenId)
		if !found {
			t.Errorf("Did not find a download token after generating it")
		}
		if tokenValue.Path != "/download/path" {
			t.Errorf("Download token path is not saved properly")
		}
		if tokenValue.Library != lib {
			t.Errorf("Download token library is not saved properly")
		}
	})

	t.Run("it returns a token only once", func(t *testing.T) {
		tokenId := tokens.GenerateDownloadToken(lib, "/download/path").Token

		tokens.GetDownloadToken(tokenId)
		_, found := tokens.GetDownloadToken(tokenId)
		if found {
			t.Errorf("Download token was not deleted after getting it once")
		}
	})
}
