CodeMirror.defineMode("rego", function () {
  return {
    token: function (stream, state) {
      // Skip whitespace
      if (stream.eatSpace()) return null;

      // Handle comments
      if (stream.match("#")) {
        stream.skipToEnd();
        return "comment";
      }

      // Handle keywords
      const keywords =
        /^(package|import|as|default|else|not|with|null|true|false|some)\b/;
      if (stream.match(keywords)) return "keyword";

      // Handle operators
      if (
        stream.match(/[:=]{1,2}|!=|<|>|<=|>=|\+|-|\*|\/|\[|\]|{|}|\(|\)|,|\.|;/)
      ) {
        return "operator";
      }

      // Handle strings
      if (stream.match('"')) {
        while (!stream.eol()) {
          if (stream.next() === '"') break;
          if (stream.next() === "\\") stream.next();
        }
        return "string";
      }

      // Handle numbers
      if (stream.match(/^-?[0-9\.]+/)) return "number";

      // Handle identifiers
      if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) return "variable";

      stream.next();
      return null;
    },
  };
});

CodeMirror.defineMIME("text/x-rego", "rego");
