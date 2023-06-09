package model

type User struct {
	ID             int    `json:"id"`
	Username       string `json:"username" gorm:"not null;unique;type:citext"`
	Name           string `json:"name" gorm:"not null;default:''"`
	HashedPassword string `json:"-" gorm:"not null"`
	IsAdmin        bool   `json:"isAdmin" gorm:"->;type:boolean GENERATED ALWAYS AS (id = 1) STORED"`
}

func (u User) GetUsername() string {
	return u.Username
}

func (u User) GetHashedPassword() string {
	return u.HashedPassword
}
