let editors = {};

function initializeEditors() {
  // Initialize Rego editor
  editors.rego = CodeMirror.fromTextArea(document.getElementById("package"), {
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

// Initialize when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initializeEditors();

  // Add format button handler
  document.getElementById("format").addEventListener("click", formatJSON);

  // Add form submit handler
  document
    .getElementById("playground")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      // Save editor contents back to textareas
      Object.entries(editors).forEach(([id, editor]) => {
        editor.save();
      });

      const payload = {
        package: document.getElementById("package").value,
        input: document.getElementById("input").value,
        data: document.getElementById("data").value,
      };

      try {
        const response = await fetch("/playground", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const text = await response.text();
        document.getElementById("response").value = text;
      } catch (err) {
        document.getElementById("response").value = "Error: " + err.message;
      }
    });
});
