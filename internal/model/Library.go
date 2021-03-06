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
	Type       LibraryType `json:"type" gorm:"not null" enums:"generic,books,movies,shows,music"`
	Name       string      `json:"name" gorm:"not null"`
	RootFolder string      `json:"rootFolder" gorm:"not null"`
}

type CanAccessLibrary struct {
	UserID    int     `gorm:"primaryKey" json:"-"`
	User      User    `gorm:"primaryKey" json:"user"`
	LibraryID int     `gorm:"primaryKey" json:"-"`
	Library   Library `gorm:"primaryKey" json:"-"`
	CanWrite  bool    `gorm:"not null" json:"canWrite"`
}
