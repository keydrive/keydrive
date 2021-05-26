package controller

import (
	"clearcloud/internal/model"
	"clearcloud/internal/service"
	"clearcloud/pkg/oauth"
	"gorm.io/gorm"
	"net/http"
)

func UsersCollection(db *gorm.DB, users *service.User, pwdEnc oauth.PasswordEncoder) http.Handler {
	list := listUsers(db, users)
	create := createUser(db, users, pwdEnc)
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		switch request.Method {
		case http.MethodGet:
			list.ServeHTTP(writer, request)
		case http.MethodPost:
			create.ServeHTTP(writer, request)
		default:
			simpleError(writer, http.StatusMethodNotAllowed)
		}
	})
}

type UserPage struct {
	TotalElements int64         `json:"totalElements"`
	Elements      []UserSummary `json:"elements"`
}

type UserSummary struct {
	ID        int    `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Username  string `json:"username"`
	IsAdmin   bool   `json:"isAdmin"`
}

func listUsers(db *gorm.DB, users *service.User) http.Handler {
	return jsonEndpoint(http.StatusOK, func(writer http.ResponseWriter, request *http.Request) (data interface{}, err error) {
		var page UserPage
		err = db.Transaction(func(tx *gorm.DB) error {
			return toPage(request, users.GetUsers(tx).Order("id"), &page.TotalElements, &page.Elements)
		})
		data = page
		return
	})
}

type CreateUserDTO struct {
	Username  string `json:"username" validate:"required"`
	FirstName string `json:"firstName" validate:"required"`
	LastName  string `json:"lastName" validate:"required"`
	Password  string `json:"password" validate:"required"`
}

func createUser(db *gorm.DB, users *service.User, pwdEnc oauth.PasswordEncoder) http.Handler {
	return jsonEndpoint(http.StatusCreated, func(writer http.ResponseWriter, request *http.Request) (interface{}, error) {
		var create CreateUserDTO
		return withValidJsonBody(writer, request, &create, func(writer http.ResponseWriter, request *http.Request) (data interface{}, err error) {
			newUser := model.User{
				FirstName:      create.FirstName,
				LastName:       create.LastName,
				Username:       create.Username,
				HashedPassword: pwdEnc.Encode(create.Password),
			}

			err = db.Transaction(func(tx *gorm.DB) error {
				result := tx.Save(&newUser)
				return result.Error
			})
			data = newUser
			return
		})
	})
}

func UserResource(db *gorm.DB, users *service.User, pwdEnc oauth.PasswordEncoder) http.Handler {
	get := getUser(db, users)
	del := deleteUser(db, users)
	update := updateUser(db, users, pwdEnc)
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		switch request.Method {
		case http.MethodGet:
			get.ServeHTTP(writer, request)
		case http.MethodPatch:
			update.ServeHTTP(writer, request)
		case http.MethodDelete:
			del.ServeHTTP(writer, request)
		default:
			simpleError(writer, http.StatusMethodNotAllowed)
		}
	})
}

type UpdateUserDTO struct {
	Username  string `json:"username" validate:""`
	FirstName string `json:"firstName" validate:""`
	LastName  string `json:"lastName" validate:""`
	Password  string `json:"password" validate:""`
}

func getUser(db *gorm.DB, users *service.User) http.Handler {
	return jsonEndpoint(http.StatusOK, func(writer http.ResponseWriter, request *http.Request) (data interface{}, err error) {
		// /api/users/:userId
		userId := pathParamInt(request, 2)

		var user model.User
		err = db.Transaction(func(tx *gorm.DB) error {
			result := users.GetUsers(tx).Take(&user, userId)
			return result.Error
		})

		data = user
		return
	})
}

func updateUser(db *gorm.DB, users *service.User, pwdEnc oauth.PasswordEncoder) http.Handler {
	return requireAdmin(jsonEndpoint(http.StatusOK, func(writer http.ResponseWriter, request *http.Request) (data interface{}, err error) {
		// /api/users/:userId
		userId := pathParamInt(request, 2)
		var update UpdateUserDTO
		return withValidJsonBody(writer, request, &update, func(writer http.ResponseWriter, request *http.Request) (data interface{}, err error) {

			var user model.User
			err = db.Transaction(func(tx *gorm.DB) error {
				result := users.GetUsers(tx).Take(&user, userId)
				if result.Error != nil {
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
				result = tx.Save(&user)
				return result.Error
			})

			data = user
			return
		})
	}))
}

func deleteUser(db *gorm.DB, users *service.User) http.Handler {
	return requireAdmin(jsonEndpoint(http.StatusOK, func(writer http.ResponseWriter, request *http.Request) (data interface{}, err error) {
		// /api/users/:userId
		userId := pathParamInt(request, 2)

		if userId == 1 {
			// you shall nog delete admin!
			return nil, ApiError{Status: http.StatusForbidden}
		}

		err = db.Transaction(func(tx *gorm.DB) error {
			result := users.GetUsers(tx).Delete(&model.User{
				ID: userId,
			})
			return result.Error
		})
		return
	}))
}
