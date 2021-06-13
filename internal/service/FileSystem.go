package service

import (
	"clearcloud/internal/model"
	"gorm.io/gorm"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type FileSystem struct {
}

func (fs *FileSystem) GetDisks() []string {
	return listDisks()
}

func (fs *FileSystem) GetEntriesForLibrary(library model.Library, tx *gorm.DB) *gorm.DB {
	return tx.Model(&model.Entry{}).
		Where("entries.library_id = ?", library.ID)
}

type EntryPath struct {
	ID       int
	Name     string
	ParentID *int
}

func (fs *FileSystem) getDiskPath(library model.Library, entryId int, tx *gorm.DB) (string, error) {
	var entry EntryPath
	if err := fs.GetEntriesForLibrary(library, tx).Take(&entry, entryId).Error; err != nil {
		return "", err
	}
	path := make([]string, 1)
	path[0] = entry.Name

	for entry.ParentID != nil {
		if err := fs.GetEntriesForLibrary(library, tx).Take(&entry, entry.ParentID).Error; err != nil {
			return "", err
		} else {
			path = append(path, entry.Name)
		}
	}

	// reverse the slice
	for i := len(path)/2 - 1; i >= 0; i-- {
		opp := len(path) - 1 - i
		path[i], path[opp] = path[opp], path[i]
	}

	return filepath.Clean(filepath.Join(library.RootFolder, strings.Join(path, "/"))), nil
}

func (fs *FileSystem) CreateFolderInLibrary(library model.Library, name string, parentId *int, tx *gorm.DB) (model.Entry, error) {
	var parent model.Entry
	newEntry := model.Entry{
		Name:      name,
		Created:   time.Now(),
		Modified:  time.Now(),
		Category:  model.CategoryFolder,
		ParentID:  parentId,
		LibraryID: library.ID,
	}

	if parentId != nil {
		if err := fs.GetEntriesForLibrary(library, tx).Where("category = ?", model.CategoryFolder).Take(&parent, *parentId).Error; err != nil {
			return newEntry, err
		}
	}

	if err := tx.Save(&newEntry).Error; err != nil {
		return newEntry, err
	}
	diskPath, err := fs.getDiskPath(library, newEntry.ID, tx)
	if err != nil {
		return newEntry, err
	}
	err = os.MkdirAll(diskPath, 0770)
	return newEntry, err
}

func (fs *FileSystem) CreateFileInLibrary(library model.Library, name string, parentId *int, data *multipart.FileHeader, tx *gorm.DB) (model.Entry, error) {
	var parent model.Entry
	newEntry := model.Entry{
		Name:      name,
		Category:  model.CategoryUnknown,
		Created:   time.Now(),
		Modified:  time.Now(),
		ParentID:  parentId,
		LibraryID: library.ID,

		Size: &data.Size,
		Type: data.Header.Get("Content-Type"),
	}

	if parentId != nil {
		if err := fs.GetEntriesForLibrary(library, tx).Where("category = ?", model.CategoryFolder).Take(&parent, *parentId).Error; err != nil {
			return newEntry, err
		}
	}

	if err := tx.Save(&newEntry).Error; err != nil {
		return newEntry, err
	}
	diskPath, err := fs.getDiskPath(library, newEntry.ID, tx)
	if err != nil {
		return newEntry, err
	}
	targetFile, err := os.Create(diskPath)
	if err != nil {
		return newEntry, err
	}
	defer targetFile.Close()
	sourceFile, err := data.Open()
	if err != nil {
		return newEntry, err
	}
	defer sourceFile.Close()
	written, err := io.Copy(targetFile, sourceFile)
	if err != nil {
		return newEntry, err
	}
	newEntry.Size = &written
	err = tx.Save(&newEntry).Error
	// TODO: metadata run
	return newEntry, err
}
