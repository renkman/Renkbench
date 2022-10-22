package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Windows struct {
	Windows []Window `json:windows`
}

type Window struct {
	Parent   *primitive.ObjectID `bson:"parent" json:"-"`
	Id       int                 `json:"id"`
	Pid      int                 `json:"pid"`
	Icons    []Icon              `json:"icons"`
	Window   WindowMetaInfo      `json:"window"`
	Content  *Content            `json:"content,omitempty"`
	Children *[]Window           `json:"children,omitempty"`
}

type WindowMetaInfo struct {
	Title string `json:"title"`
}

type Icon struct {
	Title         string `json:"title"`
	Image         Image  `json:"image"`
	ImageSelected Image  `json:"imageSelected"`
}

type Image struct {
	File   string `json:"file"`
	Width  string `json:"width"`
	Height string `json:"height"`
}
