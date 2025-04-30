package main

import (
	"bytes"
	"context"
	_ "embed"
	"encoding/json"
	"fmt"
	"syscall/js"

	"github.com/open-policy-agent/opa/rego"
	"github.com/open-policy-agent/opa/storage/inmem"
	"github.com/open-policy-agent/opa/util"
	//"github.com/tylermmorton/tmpl"
)

func evalRego(input, data, pkg string) (string, error) {
	var in any
	d := json.NewDecoder(bytes.NewBufferString(input))
	d.UseNumber()
	if err := d.Decode(&in); err != nil {
		return "", err
	}
	rg := rego.New(
		rego.Query("data.play"),
		rego.Module("play.rego", pkg),
		rego.Input(in),
	)
	if data != "" {
		var jdata map[string]any

		err := util.UnmarshalJSON([]byte(data), &jdata)
		if err != nil {
			return "", err
		}
		store := inmem.NewFromObject(jdata)
		f := rego.Store(store)
		f(rg)

	}

	ctx := context.Background()
	rs, err := rg.Eval(ctx)
	if err != nil {
		return "", err
	}
	if len(rs) == 0 {
		return "", err
	}

	m, err := json.Marshal(rs[0].Expressions[0].Value)
	if err != nil {
		return "", err
	}
	return string(m), nil
}

func regoWrapper() js.Func {
	jsonFunc := js.FuncOf(func(this js.Value, args []js.Value) any {
		if len(args) < 3 {
			return "Invalid no arguments passed"
		}
		inputJSON := args[0].String()
		dataJSON := args[1].String()
		pkg := args[2].String()
		pretty, err := evalRego(inputJSON, dataJSON, pkg)
		if err != nil {
			fmt.Printf("unable to convert to json %s\n", err)
			return err.Error()
		}
		return pretty
	})
	return jsonFunc
}

func main() {
	js.Global().Set("evalRego", regoWrapper())
	fmt.Println("playground loaded")
	<-make(chan struct{})
}
