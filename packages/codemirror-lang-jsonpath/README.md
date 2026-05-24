# @jsonpath-tools/codemirror-lang-jsonpath

[Documentation](https://janjorka.github.io/jsonpath-tools/documentation/editor/codemirror-extension) | [NPM Package](https://www.npmjs.com/package/@jsonpath-tools/codemirror-lang-jsonpath)

JSONPath ([RFC 9535](https://datatracker.ietf.org/doc/rfc9535/)) language support for CodeMirror editor.

## Quickstart

Installation:
```sh
npm install @jsonpath-tools/codemirror-lang-jsonpath
```

Basic usage:
```ts
import { EditorView, basicSetup } from "codemirror";
import { 
    jsonpath, 
    updateQueryOptionsEffect, 
    updateQueryArgumentEffect, 
    updateQueryArgumentTypeEffect
} 
from "@jsonpath-tools/codemirror-lang-jsonpath";
import { defaultQueryOptions, jsonSchemaToType } from "@jsonpath-tools/jsonpath";

// Convert JSON Schema to a type.
const queryArgumentType = jsonSchemaToType({ schema: queryArgumentSchema });

// Create a CodeMirror editor with the `jsonpath` extension.
const editor = new EditorView({
    doc: `$..inventory[?@.features[?@ == "Bluetooth"] && match(@.make, "[tT].+")]`,
    extensions: [
        basicSetup,
        jsonpath()
    ],
    parent: document.getElementById("app")!
});

// Dispatch configuration.
editor.dispatch({
    effects: [
        updateQueryOptionsEffect.of(defaultQueryOptions),
        updateQueryArgumentEffect.of(queryArgument),
        updateQueryArgumentTypeEffect.of(queryArgumentType)
    ] 
});
```


[More information](https://janjorka.github.io/jsonpath-tools/documentation/editor/codemirror-extension)