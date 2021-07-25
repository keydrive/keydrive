package service

import (
	"keydrive/internal/model"
	"fmt"
	"testing"
)

var categoryTests = []struct {
	name             string
	mimeType         string
	isDir            bool
	expectedCategory model.Category
	expectedMimeType string
}{
	{"anything.pdf", "", false, model.CategoryDocument, "application/pdf"},
	{"anything.pdf", "", true, model.CategoryFolder, ""},
	{"arbirary_without_ext", "text/arbitrary", false, model.CategoryDocument, "text/arbitrary"},
	{"error.log", "", false, model.CategoryDocument, "text/plain"},
	{"unknown", "", false, model.CategoryBinary, ""},
}

func TestGetFileCategory(t *testing.T) {
	for _, test := range categoryTests {
		t.Run(fmt.Sprintf("%s/%s/%v", test.name, test.mimeType, test.isDir), func(t *testing.T) {
			cat, mime := GetFileCategory(test.name, test.mimeType, test.isDir)
			if cat != test.expectedCategory {
				t.Errorf("Expected category [%s] but got [%s]", test.expectedCategory, cat)
			}
			if mime != test.expectedMimeType {
				t.Errorf("Expected mime type [%s] but got [%s]", test.expectedMimeType, mime)
			}
		})
	}
}
