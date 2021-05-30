package controller

import (
	"clearcloud/internal/model"
	"clearcloud/internal/service"
	"clearcloud/pkg/oauth"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
)

type UserSummary struct {
	ID        int    `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Username  string `json:"username"`
	IsAdmin   bool   `json:"isAdmin"`
}

type UserPage struct {
	TotalElements int64         `json:"totalElements"`
	Elements      []UserSummary `json:"elements"`
}

func ListUsers(db *gorm.DB, users *service.User) gin.HandlerFunc {
	return func(c *gin.Context) {
		var page UserPage
		returnPage(c, users.GetUsers(db).Order("id"), &page, &page.TotalElements, &page.Elements)
	}
}

type CreateUserDTO struct {
	Username  string `json:"username" validate:"required"`
	FirstName string `json:"firstName" validate:"required"`
	LastName  string `json:"lastName" validate:"required"`
	Password  string `json:"password" validate:"required"`
}

func CreateUser(db *gorm.DB, pwdEnc oauth.PasswordEncoder) gin.HandlerFunc {
	return func(c *gin.Context) {
		var create CreateUserDTO
		if err := c.ShouldBindJSON(&create); err != nil {
			writeError(c, err)
			return
		}
		newUser := model.User{
			FirstName:      create.FirstName,
			LastName:       create.LastName,
			Username:       create.Username,
			HashedPassword: pwdEnc.Encode(create.Password),
		}
		if result := db.Save(&newUser); result.Error != nil {
			writeError(c, result.Error)
			return
		}
		c.JSON(http.StatusCreated, newUser)
	}
}

type UpdateUserDTO struct {
	Username  string `json:"username" validate:""`
	FirstName string `json:"firstName" validate:""`
	LastName  string `json:"lastName" validate:""`
	Password  string `json:"password" validate:""`
}

func GetUser(db *gorm.DB, users *service.User) gin.HandlerFunc {
	return func(c *gin.Context) {
		userId, ok := intParam(c, "userId")
		if !ok {
			c.JSON(http.StatusNotFound, nil)
			return
		}
		var user model.User
		if result := users.GetUsers(db).Take(&user, userId); result.Error != nil {
			writeError(c, result.Error)
			return
		}
		c.JSON(http.StatusOK, user)
	}
}

func UpdateUser(db *gorm.DB, users *service.User, pwdEnc oauth.PasswordEncoder) gin.HandlerFunc {
	return func(c *gin.Context) {
		userId, ok := intParam(c, "userId")
		if !ok {
			c.JSON(http.StatusNotFound, nil)
			return
		}

		var update UpdateUserDTO
		if err := c.ShouldBindJSON(&update); err != nil {
			writeError(c, err)
			return
		}
		err := db.Transaction(func(tx *gorm.DB) error {
			var user model.User
			if result := users.GetUsers(tx).Take(&user, userId); result.Error != nil {
				return result.Error
			}
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

			return nil
		})
		if err != nil {
			writeError(c, err)
			return
		}
	}
}

func DeleteUser(db *gorm.DB, users *service.User) gin.HandlerFunc {
	return func(c *gin.Context) {
		userId, ok := intParam(c, "userId")
		if !ok {
			c.JSON(http.StatusNotFound, nil)
			return
		}
		if userId == 1 {
			writeJsonError(c, ApiError{
				Status:      http.StatusConflict,
				Description: "Deleting the admin would be a bad idea",
			})
			return
		}

		if result := users.GetUsers(db).Delete(&model.User{
			ID: userId,
		}); result.Error != nil {
			writeError(c, result.Error)
			return
		} else {
			c.JSON(http.StatusNoContent, nil)
		}
	}
}
