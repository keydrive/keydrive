package controller

import (
	"keydrive/internal/model"
	"keydrive/internal/service"
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

// ListUsers
// @Tags Authentication
// @Router /api/users [get]
// @Summary Search the collection of users
// @Security OAuth2
// @Produce  json
// @Success 200 {object} UserPage
// @Param page query int false "The page number to fetch" default(1)
// @Param limit query int false "The maximum number of elements to return" default(20)
func ListUsers(db *gorm.DB, users *service.User) gin.HandlerFunc {
	return func(c *gin.Context) {
		var page UserPage
		returnPage(c, users.GetUsers(db).Order("id"), &page, &page.TotalElements, &page.Elements)
	}
}

type CreateUserDTO struct {
	Username  string `json:"username" binding:"required"`
	FirstName string `json:"firstName" binding:"required"`
	LastName  string `json:"lastName" binding:"required"`
	Password  string `json:"password" binding:"required"`
}

// CreateUser
// @Tags Authentication
// @Router /api/users [post]
// @Summary Add a new user
// @Security OAuth2
// @Produce  json
// @Param body body CreateUserDTO true "The new user"
// @Success 201 {object} model.User
// @Failure 409 {object} ApiError "This username is already taken"
func CreateUser(db *gorm.DB, pwdEnc *service.BcryptEncoder) gin.HandlerFunc {
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

// GetUser
// @Tags Authentication
// @Router /api/users/{userId} [get]
// @Summary Get user details
// @Security OAuth2
// @Produce  json
// @Param userId path int true "The user id"
// @Success 200 {object} model.User
func GetUser(db *gorm.DB, users *service.User) gin.HandlerFunc {
	return func(c *gin.Context) {
		userId, ok := intParam(c, "userId")
		if !ok {
			simpleError(c, http.StatusNotFound)
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

type UpdateUserDTO struct {
	Username  string `json:"username" binding:""`
	FirstName string `json:"firstName" binding:""`
	LastName  string `json:"lastName" binding:""`
	Password  string `json:"password" binding:""`
}

// UpdateUser
// @Tags Authentication
// @Router /api/users/{userId} [patch]
// @Summary Update an existing user
// @Security OAuth2
// @Produce  json
// @Param body body UpdateUserDTO true "The changes"
// @Param userId path int true "The user id"
// @Success 200 {object} model.User
func UpdateUser(db *gorm.DB, users *service.User, pwdEnc *service.BcryptEncoder) gin.HandlerFunc {
	return func(c *gin.Context) {
		userId, ok := intParam(c, "userId")
		if !ok {
			simpleError(c, http.StatusNotFound)
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

			c.JSON(http.StatusOK, user)
			return nil
		})
		if err != nil {
			writeError(c, err)
			return
		}
	}
}

// DeleteUser
// @Tags Authentication
// @Router /api/users/{userId} [delete]
// @Summary Delete a user
// @Security OAuth2
// @Produce  json
// @Param userId path int true "The user id"
// @Success 204
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
