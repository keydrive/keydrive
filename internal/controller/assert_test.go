package controller

import (
	"encoding/json"
	"net/http/httptest"
	"testing"
)

func assertStatus(t *testing.T, recorder *httptest.ResponseRecorder, status int) {
	if recorder.Code != status {
		t.Errorf("Expected status %d but got: %d", status, recorder.Code)
	}
}

func assertJsonUnmarshal(t *testing.T, recorder *httptest.ResponseRecorder, v interface{}) {
	if err := json.Unmarshal(recorder.Body.Bytes(), v); err != nil {
		t.Errorf("Could not unmarshal JSON response: %s", err)
	}
}
