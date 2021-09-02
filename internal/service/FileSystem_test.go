package service

import (
	"io"
	"keydrive/internal/model"
	"os"
	"path/filepath"
	"testing"
)

func TestFileSystem_OpenFile(t *testing.T) {
	tmpDir := t.TempDir()
	_ = os.WriteFile(filepath.Join(tmpDir, "test.bin"), []byte{1, 2, 3}, 0777)
	lib := model.Library{
		RootFolder: tmpDir,
	}
	fs := FileSystem{}
	stream, err := fs.OpenFile(lib, "test.bin")
	if err != nil {
		t.Error(err.Error())
	}
	data, _ := io.ReadAll(stream)
	if data[0] != 1 || data[1] != 2 || data[2] != 3 {
		t.Errorf("Invalid bytes came back")
	}
}
