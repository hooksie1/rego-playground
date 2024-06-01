package main

import (
	"bytes"
	_ "embed"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/open-policy-agent/opa/rego"
	//"github.com/tylermmorton/tmpl"
)

//var (
//	//go:embed index.tmpl.html
//	tmplIndex string
//
//	IndexTemplate = tmpl.MustCompile(&Index{})
//)

type Request struct {
	Input   string `json:"input"`
	Data    string `json:"data"`
	Package string `json:"package"`
}

//func (*Index) TemplateText() string {
//	return tmplIndex
//}

func playground(w http.ResponseWriter, r *http.Request) {
	var req Request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad request", 400)
	}

	var input any
	d := json.NewDecoder(bytes.NewBufferString(req.Input))
	d.UseNumber()
	if err := d.Decode(&input); err != nil {
		fmt.Println(err)
		http.Error(w, "bad request", 400)
		return
	}

	rego := rego.New(
		rego.Query("data.play"),
		rego.Module("play.rego", req.Package),
		rego.Input(input),
	)

	rs, err := rego.Eval(r.Context())
	if err != nil {
		http.Error(w, err.Error(), 500)
	}

	data, err := json.Marshal(rs[0].Expressions[0].Value)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.Write(data)

}

func main() {
	r := http.NewServeMux()

	r.Handle("POST /playground", http.HandlerFunc(playground))
	r.Handle("/", http.FileServer(http.Dir("static")))

	http.ListenAndServe(":8080", r)

}
