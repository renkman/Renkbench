package model

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestArticleContentSerialization(t *testing.T) {
	expected := `{"title":"Foo","articles":[{"title":"Bar","text":"Baz"}]}
`
	content := &Content{"Foo", nil, &[]Article{Article{"Bar", "Baz"}}}
	var writer strings.Builder
	json.NewEncoder(&writer).Encode(content)
	result := writer.String()

	if result != expected {
		t.Errorf("Expected result %v, got %v instead", expected, result)
	}
}

func TestWindowArticleContentSerialization(t *testing.T) {
	expected := `{"id":1,"pid":0,"icons":[],"window":{"title":"Window"},"content":{"title":"Foo","articles":[{"title":"Bar","text":"Baz"}]}}
`
	content := &Content{"Foo", nil, &[]Article{Article{"Bar", "Baz"}}}
	window := &Window{nil, 1, 0, []Icon{}, WindowMetaInfo{"Window"}, content, nil}

	var writer strings.Builder
	json.NewEncoder(&writer).Encode(window)
	result := writer.String()

	if result != expected {
		t.Errorf("Expected result %v, got %v instead", expected, result)
	}
}
