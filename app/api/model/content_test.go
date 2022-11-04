package model

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestArticleContentSerialization(t *testing.T) {
	expected := `{"title":"Foo","articles":[{"title":"Bar","text":"Baz"}]}
`
	title := "Foo"
	content := &Content{&title, &[]Article{Article{"Bar", "Baz"}}, nil}
	var writer strings.Builder
	json.NewEncoder(&writer).Encode(content)
	result := writer.String()

	if result != expected {
		t.Errorf("Expected result %v, got %v instead", expected, result)
	}
}

func TestWindowArticleContentSerialization(t *testing.T) {
	expected := `{"id":1,"pid":0,"icons":{"title":"Title","image":{"file":"disk.png","width":32,"height":32},"imageSelected":{"file":"disk_selected.png","width":32,"height":32}},"window":{"title":"Window"},"content":{"title":"Foo","articles":[{"title":"Bar","text":"Baz"}]}}
`
	title := "Foo"
	content := &Content{&title, &[]Article{Article{"Bar", "Baz"}}, nil}
	window := &Window{nil, 1, 0, Icon{"Title", Image{"disk.png", 32, 32}, Image{"disk_selected.png", 32, 32}}, WindowMetaInfo{"Window"}, content, nil}

	var writer strings.Builder
	json.NewEncoder(&writer).Encode(window)
	result := writer.String()

	if result != expected {
		t.Errorf("Expected result %v, got %v instead", expected, result)
	}
}
