package service

import (
	"clearcloud/internal/model"
	"errors"
	"io"
	"io/ioutil"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type FileInfo struct {
	Name     string         `json:"name"`
	Modified time.Time      `json:"modified"`
	Parent   string         `json:"parent"`
	Category model.Category `json:"category"`
	MimeType string         `json:"mimeType,omitempty"`
	Size     int64          `json:"size,omitempty"`
}

type FileSystem struct {
}

func (fs *FileSystem) GetDisks() []string {
	return listDisks()
}

func (fs *FileSystem) cleanRelativePath(relPath string) string {
	relPath = filepath.Clean("/" + strings.TrimPrefix(relPath, "/"))
	if relPath == "." {
		return "/"
	}
	return "/" + strings.TrimPrefix(relPath, "/")
}

func (fs *FileSystem) resolve(library model.Library, path ...string) string {
	return filepath.Clean(filepath.Join(library.RootFolder, filepath.Join(path...)))
}

func (fs *FileSystem) getFileCategory(name string, mimeType string, isDir bool) (model.Category, string) {
	if isDir {
		return model.CategoryFolder, ""
	}
	if mimeType == "" || mimeType == "application/octet-stream" {
		if trueMimeType, ok := ExtToMime[filepath.Ext(name)]; ok {
			mimeType = trueMimeType
		}
	}

	if cat, ok := MimeToCategory[mimeType]; ok {
		return cat, mimeType
	}
	return model.CategoryUnknown, mimeType
}

func (fs *FileSystem) GetEntriesForLibrary(library model.Library, parentPath string) ([]FileInfo, error) {
	parentPath = fs.cleanRelativePath(parentPath)
	target := fs.resolve(library, parentPath)

	files, err := ioutil.ReadDir(target)
	if err != nil {
		return nil, err
	}

	output := make([]FileInfo, len(files))

	for i, file := range files {
		category, _ := fs.getFileCategory(file.Name(), "", file.IsDir())
		file.ModTime()
		output[i] = FileInfo{
			Name:     file.Name(),
			Category: category,
			Parent:   parentPath,
			Modified: file.ModTime(),
		}
	}

	return output, nil
}

func (fs *FileSystem) GetEntryMetadata(library model.Library, path string) (FileInfo, error) {
	path = fs.cleanRelativePath(path)
	parentPath := filepath.Dir(path)
	target := fs.resolve(library, path)

	file, err := os.Stat(target)
	if err != nil {
		return FileInfo{}, err
	}

	return fs.toInfo(file, parentPath, ""), nil
}

func (fs *FileSystem) CreateFolderInLibrary(library model.Library, name string, parentPath string) (FileInfo, error) {
	parentPath = fs.cleanRelativePath(parentPath)
	target := fs.resolve(library, parentPath, name)
	err := os.MkdirAll(target, 0770)
	if err != nil {
		return FileInfo{}, err
	}
	created, err := os.Stat(target)
	if err != nil {
		return FileInfo{}, err
	}
	return fs.toInfo(created, parentPath, ""), nil
}

func (fs *FileSystem) CreateFileInLibrary(library model.Library, name string, parentPath string, data *multipart.FileHeader) (FileInfo, error) {
	parentPath = fs.cleanRelativePath(parentPath)
	if name == "" {
		name = data.Filename
	}
	target := fs.resolve(library, parentPath, name)

	soureFile, err := data.Open()
	if err != nil {
		return FileInfo{}, err
	}
	defer soureFile.Close()

	targetFile, err := os.Create(target)
	if err != nil {
		return FileInfo{}, err
	}
	defer targetFile.Close()
	written, err := io.Copy(targetFile, soureFile)
	if err != nil {
		return FileInfo{}, err
	}
	if written != data.Size {
		return FileInfo{}, errors.New("size mismatch")
	}
	file, err := os.Stat(target)
	if err != nil {
		return FileInfo{}, err
	}
	return fs.toInfo(file, parentPath, data.Header.Get("Content-Type")), nil
}

func (fs *FileSystem) DeleteEntryInLibrary(library model.Library, path string) error {
	path = fs.cleanRelativePath(path)
	target := fs.resolve(library, path)
	err := os.RemoveAll(target)
	if err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}

func (fs *FileSystem) toInfo(file os.FileInfo, parent string, mimeType string) FileInfo {
	name := file.Name()
	category, mimeType := fs.getFileCategory(name, mimeType, file.IsDir())
	size := file.Size()
	if file.IsDir() {
		size = 0
		mimeType = ""
	}
	return FileInfo{
		Name:     name,
		Modified: file.ModTime(),
		Parent:   parent,
		Category: category,
		MimeType: mimeType,
		Size:     size,
	}
}
