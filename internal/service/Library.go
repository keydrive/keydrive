package service

import (
	"gorm.io/gorm"
	"keydrive/internal/model"
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

func (s *Library) GetLibrariesWithAccessForUser(user model.User, tx *gorm.DB) *gorm.DB {
	query := s.GetLibrariesForUser(user, tx).
		Order("id")
	if user.IsAdmin {
		query.Select("*, TRUE as can_write")
	} else {
		query = query.Select("*, can_access_libraries.can_write as can_write")
	}
	return query
}
