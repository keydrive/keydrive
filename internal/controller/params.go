package controller

import (
	"github.com/gin-gonic/gin"
	"strconv"
)

func intParam(c *gin.Context, name string) (int, bool) {
	stringParam := c.Param(name)
	if stringParam == "" {
		return 0, false
	}
	if intParam, err := strconv.Atoi(stringParam); err == nil {
		return intParam, true
	} else {
		return 0, false
	}
}
