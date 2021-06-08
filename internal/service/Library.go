package service

import (
	"clearcloud/internal/model"
	"gorm.io/gorm"
)

type Library struct {
}

func (s *Library) GetLibrariesForUser(user model.User, tx *gorm.DB) *gorm.DB {
	query := tx.Model(&model.Library{})
	if user.IsAdmin {
		return query
	}
	return query.
		Joins("left join can_access_libraries on can_access_libraries.library_id = libraries.id").
		Where("can_access_libraries.user_id = ?", user.ID)
}
