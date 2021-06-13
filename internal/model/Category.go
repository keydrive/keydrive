package model

type Category string

const (
	CategoryFolder   Category = "Folder"
	CategoryDocument Category = "Document"
	CategoryUnknown  Category = "Binary"
)
