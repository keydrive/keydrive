package model

type User struct {
	ID             int    `json:"id"`
	Username       string `json:"username" gorm:"not null;unique;type:citext"`
	Name           string `json:"name" gorm:"not null;default:''"`
	HashedPassword string `json:"-" gorm:"not null"`

	// Note that this column is ignored from automigration, because generated columns cannot be altered.
	IsAdmin bool `json:"isAdmin" gorm:"->;type:boolean GENERATED ALWAYS AS (id = 1) STORED;-:migration"`
}

func (u User) GetUsername() string {
	return u.Username
}

func (u User) GetHashedPassword() string {
	return u.HashedPassword
}
