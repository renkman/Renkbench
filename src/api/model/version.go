package model

type Version struct {
	Version string `json:"version"`
	Build   string `json:"build"`
	Release string `json:"release"`
}
