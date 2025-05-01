let editors = {};

function initializeEditors() {
  // Initialize Rego editor
  editors.package = CodeMirror.fromTextArea(document.getElementById("package"), {
    mode: "rego",
    lineNumbers: true,
    theme: "default",
    autoCloseBrackets: true,
    matchBrackets: true,
    lineWrapping: true,
  });

  // Initialize JSON editors
  editors.input = CodeMirror.fromTextArea(document.getElementById("input"), {
    mode: "application/json",
    lineNumbers: true,
 theme: "default",
    autoCloseBrackets: true,
    matchBrackets: true,
  });

  editors.data = CodeMirror.fromTextArea(document.getElementById("data"), {
    mode: "application/json",
    lineNumbers: true,
    theme: "default",
    autoCloseBrackets: true,
    matchBrackets: true,
  });

  // Set sizes
  Object.values(editors).forEach((editor) => {
    let height = (editor.options.mode === 'rego') ? "75%" : "200px";
    editor.setSize("100%", height);
  });
}


function formatJSON() {
  try {
    ["input", "data"].forEach((id) => {
      const editor = editors[id];
      const content = editor.getValue().trim();

      if (content) {
        const formatted = JSON.stringify(JSON.parse(content), null, 2);
        editor.setValue(formatted);
      }
    });
  } catch (e) {
    alert("Invalid JSON in input or data field");
  }
}

function saveEditorContent() {
  Object.entries(editors).forEach(([id, editor]) => {
    editor.save();
  });
}

function hydrate() {
  const parser = new URL(window.location.href);
  let m = new Map(Object.entries(editors));
  parser.searchParams.forEach((val, param) => {
    if (editors[param]) {
      editors[param].setValue(decompressData(val))
    }
  });
}

function updateSearchParams(params) {
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  })

  history.replaceState(null, '', url);
}

function compressAndUpdateURL() {
  const params = {};
  Object.entries(editors).forEach(([id, editor]) => {
    params[id] = compressData(editor.getValue());
  })
  updateSearchParams(params);
}


function init() {
    initializeEditors();
    hydrate();
  
    // Add format button handler
    document.getElementById("format").addEventListener("click", formatJSON);
  
    // Add form submit handler
    document.getElementById("playground").addEventListener("submit", async (e) => {
        e.preventDefault();
  
        saveEditorContent();
        compressAndUpdateURL()
  
        const response = evalRego(
          document.getElementById("input").value,
          document.getElementById("data").value,
          document.getElementById("package").value,
        );


        document.getElementById("response").value = JSON.stringify(JSON.parse(response), null, 2);
      });
}
