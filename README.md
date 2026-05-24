- [JSONPath Tools](#jsonpath-tools)
  - [Query JSON data](#query-json-data)
  - [React JSONPath Editor](#react-jsonpath-editor)

# JSONPath Tools

[JSONPath Playground](https://jsonpath.dev) | [Documentation](https://janjorka.github.io/jsonpath-tools/)

JSONPath Tools is a set of libraries and applications for **JSONPath query language ([RFC 9535](https://datatracker.ietf.org/doc/rfc9535/))**. It provides tools to evaluate JSONPath queries, analyze and test them. It also contains an advanced code editor component to edit JSONPath queries.

It has the following parts:

- [Core Library](https://janjorka.github.io/jsonpath-tools/documentation/core/get-started) (evaluation, analysis and editor services)
- [CodeMirror Editor Extension](https://janjorka.github.io/jsonpath-tools/documentation/editor/codemirror-extension)
- [React Editor Component](https://janjorka.github.io/jsonpath-tools/documentation/editor/react-component)
- [Playground Web Application](https://jsonpath.dev)

![Image from the JSONPath Playground](https://janjorka.github.io/jsonpath-tools/assets/image.CirRxT7e.png)

## Query JSON data

Installation:
```sh
npm install @jsonpath-tools/jsonpath
```

Select nodes:
```ts
import { JSONPath } from "@jsonpath-tools/jsonpath";

const queryArgument = {
    books: [
        { title: "1984", author: "George Orwell" },
        { title: "Epic of Gilgamesh", author: null },
        { title: "The Old Man and the Sea", author: "Ernest Hemingway" }
    ]
};

const nodes = JSONPath.select(`$.books[?@.author != null].title`, queryArgument);
```

Getting the selected values:
```ts
const values = nodes.toValues();
```

Getting paths to the selected values:
```ts
const paths = nodes.toNormalizedPaths();
```

## React JSONPath Editor

Installation:
```sh
npm install @jsonpath-tools/jsonpath-editor-react
```
Basic usage:
```tsx
import { useState } from "react";
import { JSONPathEditor } from "@jsonpath-tools/jsonpath-editor-react";
import { defaultQueryOptions, jsonSchemaToType } from "@jsonpath-tools/jsonpath";

const queryArgumentType = jsonSchemaToType({ schema: queryArgumentSchema });

export default function Example() {
    const [value, setValue] = useState(`$..inventory.*`);
    return (
        <JSONPathEditor
            value={value}
            onValueChange={setValue}
            queryOptions={defaultQueryOptions}
            queryArgument={queryArgument}
            queryArgumentType={queryArgumentType} />
    );
}
```

It should look like this:

![Expected result](https://janjorka.github.io/jsonpath-tools/assets/react-component.BELZzF-R.png)
