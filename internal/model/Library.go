package model

type LibraryType string

const (
	TypeGeneric LibraryType = "generic"
	TypeBooks   LibraryType = "books"
	TypeMovies  LibraryType = "movies"
	TypeShows   LibraryType = "shows"
	TypeMusic   LibraryType = "music"
)

type Library struct {
	ID         int         `json:"id"`
	Type       LibraryType `json:"type" gorm:"not null"`
	Name       string      `json:"name" gorm:"not null"`
	RootFolder string      `json:"rootFolder" gorm:"not null"`
}

type CanAccessLibrary struct {
	UserID    int     `gorm:"primaryKey"`
	User      User    `gorm:"primaryKey"`
	LibraryID int     `gorm:"primaryKey"`
	Library   Library `gorm:"primaryKey"`
	CanWrite  bool    `gorm:"not null"`
}
