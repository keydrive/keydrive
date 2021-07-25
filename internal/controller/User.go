package controller

import (
	"keydrive/internal/service"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
)

// GetAuthenticatedUserInfo
// @Tags Authentication
// @Router /api/user [get]
// @Summary Get the currently authenticated user information
// @Security OAuth2
// @Produce  json
// @Success 200 {object} model.User
func GetAuthenticatedUserInfo() gin.HandlerFunc {
	return func(c *gin.Context) {
		user, _ := GetAuthenticatedUser(c)
		c.JSON(http.StatusOK, user)
	}
}

// UpdateAuthenticatedUser
// @Tags Authentication
// @Router /api/user [patch]
// @Summary Update the currently authenticated user
// @Security OAuth2
// @Produce  json
// @Param body body UpdateUserDTO true "The changes"
// @Success 200 {object} model.User
func UpdateAuthenticatedUser(db *gorm.DB, pwdEnc *service.BcryptEncoder) gin.HandlerFunc {
	return func(c *gin.Context) {
		user, found := GetAuthenticatedUser(c)
		if !found {
			simpleError(c, http.StatusInternalServerError)
			return
		}

		var update UpdateUserDTO
		if err := c.ShouldBindJSON(&update); err != nil {
			writeError(c, err)
			return
		}
		err := db.Transaction(func(tx *gorm.DB) error {
			if update.Username != "" {
				user.Username = update.Username
			}
			if update.FirstName != "" {
				user.FirstName = update.FirstName
			}
			if update.LastName != "" {
				user.LastName = update.LastName
			}
			if update.Password != "" {
				user.HashedPassword = pwdEnc.Encode(update.Password)
			}
			if result := tx.Save(&user); result.Error != nil {
				return result.Error
			}

			c.JSON(http.StatusOK, user)
			return nil
		})
		if err != nil {
			writeError(c, err)
			return
		}
	}
}
