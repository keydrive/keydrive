package model

import "time"

type DownloadToken struct {
	Token     string  `gorm:"primaryKey;type:uuid"`
	LibraryID int     `gorm:"not null"`
	Library   Library `gorm:"not null"`
	Path      string  `gorm:"not null"`
	CreatedAt time.Time
}
