package model

import "time"

type Entry struct {
	// Required Fields
	ID       int       `json:"id"`
	Name     string    `json:"name" gorm:"not null;uniqueIndex:idx_name"`
	Category Category  `json:"category" gorm:"not null"`
	Created  time.Time `json:"created" gorm:"not null"`
	Modified time.Time `json:"modified" gorm:"not null"`

	// Relations
	ParentID  int     `json:"parent,omitempty" gorm:"default:0;uniqueIndex:idx_name"`
	Parent    *Entry  `json:"-"`
	LibraryID int     `json:"-" gorm:"not null"`
	Library   Library `json:"-" gorm:"not null"`

	// File Metadata
	Type string `json:"type"`
	Size *int64 `json:"size"`
}
