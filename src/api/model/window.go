package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type WindowResponse struct {
	Windows []Window `json:"windows"`
}

type Window struct {
	Parent     *primitive.ObjectID `bson:"parent" json:"-"`
	Id         int                 `json:"id"`
	Pid        int                 `json:"pid"`
	Window     WindowMetaInfo      `json:"window"`
	Content    *Content            `json:"content,omitempty"`
	ChildIcons *[]Icon             `json:"ChildIcons,omitempty"`
}

type WindowMetaInfo struct {
	Title string `json:"title"`
}

type Icon struct {
	Id            int    `json:"id"`
	Title         string `json:"title"`
	Image         Image  `json:"image"`
	ImageSelected Image  `json:"imageSelected"`
}

type Image struct {
	File   string `json:"file"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}
