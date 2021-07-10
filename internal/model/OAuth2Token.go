package model

type OAuth2Token struct {
	AccessToken string `gorm:"primaryKey;type:uuid"`
	UserID      int    `gorm:"not null;constraint:OnDelete:CASCADE"`
	User        User   `gorm:"not null;constraint:OnDelete:CASCADE"`
}

func (t OAuth2Token) GetClient() *Client {
	return &Client{ID: "web"}
}
