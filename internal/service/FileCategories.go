package service

import "clearcloud/internal/model"

// TODO: Collect WAY more types

var ExtToMime = map[string]string{
	".adoc":     "text/asciidoc",
	".asciidoc": "test/asciidoc",
}

var MimeToCategory = map[string]model.Category{
	"application/pdf":          model.CategoryDocument,
	"text/asciidoc":            model.CategoryDocument,
	"text/markdown":            model.CategoryDocument,
	"application/octet-stream": model.CategoryUnknown,
}
