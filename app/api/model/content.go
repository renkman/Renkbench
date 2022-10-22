package model

type Content struct {
	Title    string     `json:"title"`
	Form     *string    `json:"form,omitempty"`
	Articles *[]Article `json:"articles,omitempty"`
}

type Article struct {
	Title string `json:"title"`
	Text  string `json:"text"`
}
