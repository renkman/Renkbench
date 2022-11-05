package model

type Content struct {
	Title    *string    `json:"title"`
	Articles *[]Article `json:"articles,omitempty"`
	Form     *string    `json:"form,omitempty"`
}

type Article struct {
	Title string `json:"title"`
	Text  string `json:"text"`
}
