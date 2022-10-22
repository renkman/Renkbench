package model

type Menu struct {
	Name    string      `json:"name"`
	Entries []MenuEntry `json:"entries"`
}

type MenuEntry struct {
	Name       string `json:"name"`
	Command    string `json:"command"`
	Conditions string `json:"conditions"`
}
