package controller

import (
	"clearcloud/internal/service"
	"gorm.io/gorm"
	"net/http"
)

func UsersController(db *gorm.DB, users *service.User) http.Handler {
	list := listUsers(db, users)
	create := createUser(db, users)
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
	ID        uint   `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Username  string `json:"username"`
}

func listUsers(db *gorm.DB, users *service.User) http.Handler {
	return jsonEndpoint(http.StatusOK, func(writer http.ResponseWriter, request *http.Request) (data interface{}, err error) {
		var page UserPage
		err = db.Transaction(func(tx *gorm.DB) error {
			return toPage(users.GetUsers(tx), &page.TotalElements, &page.Elements)
		})
		data = page
		return
	})
}

type CreateUserDTO struct {
	FirstName string `json:"firstName" validate:"required"`
	LastName  string `json:"lastName" validate:"required"`
	Username  string `json:"username" validate:"required"`
}

func createUser(db *gorm.DB, users *service.User) http.Handler {
	return jsonEndpoint(http.StatusCreated, func(writer http.ResponseWriter, request *http.Request) (interface{}, error) {
		var create CreateUserDTO
		return withValidJsonBody(writer, request, &create, func(writer http.ResponseWriter, request *http.Request) (interface{}, error) {
			return "Nice!", nil
		})
	})
}
