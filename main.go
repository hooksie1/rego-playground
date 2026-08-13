package main

import (
	"bytes"
	_ "embed"
	"encoding/json"
	"net/http"

	"github.com/open-policy-agent/opa/rego"
	"github.com/open-policy-agent/opa/storage/inmem"
	"github.com/open-policy-agent/opa/util"
	//"github.com/tylermmorton/tmpl"
)

type Request struct {
	Input   string `json:"input"`
	Data    string `json:"data"`
	Package string `json:"package"`
}

func playgrounds(w http.ResponseWriter, r *http.Request) {
	var req Request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), 200)
	}

	var input any
	d := json.NewDecoder(bytes.NewBufferString(req.Input))
	d.UseNumber()
	if err := d.Decode(&input); err != nil {
		http.Error(w, err.Error(), 200)
		return
	}

	rg := rego.New(
		rego.Query("data.play"),
		rego.Module("play.rego", req.Package),
		rego.Input(input),
	)
	if req.Data != "" {
		var jdata map[string]any

		err := util.UnmarshalJSON([]byte(req.Data), &jdata)
		if err != nil {
			http.Error(w, err.Error(), 200)
			return
		}
		store := inmem.NewFromObject(jdata)
		f := rego.Store(store)
		f(rg)

	}

	rs, err := rg.Eval(r.Context())
	if err != nil {
		http.Error(w, err.Error(), 200)
		return
	}
	if len(rs) == 0 {
		http.Error(w, "something is really wrong", 500)
		return
	}

	e := json.NewEncoder(w)
	e.SetIndent("", "  ")
	e.Encode(rs[0].Expressions[0].Value)
}

func main() {
	r := http.NewServeMux()

	r.Handle("/whoa", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request){w.Write([]byte("Hello"))}))
	r.Handle("POST /playgrounds", http.HandlerFunc(playgrounds))
	r.Handle("/", http.FileServer(http.Dir("static")))

	http.ListenAndServe(":8080", r)

}
