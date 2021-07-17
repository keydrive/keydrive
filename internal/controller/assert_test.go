package controller

import (
	"net/http/httptest"
	"testing"
)

func assertStatus(t *testing.T, recorder *httptest.ResponseRecorder, status int) {
	if recorder.Code != status {
		t.Errorf("Expected status %d but got: %d", status, recorder.Code)
	}
}
