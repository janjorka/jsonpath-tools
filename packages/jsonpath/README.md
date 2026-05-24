# @jsonpath-tools/jsonpath

[Documentation](https://janjorka.github.io/jsonpath-tools/documentation/core/get-started) | [NPM Package](https://www.npmjs.com/package/@jsonpath-tools/jsonpath)

JSONPath ([RFC 9535](https://datatracker.ietf.org/doc/rfc9535/)) query evaluation, analysis and editor services.

## Quickstart

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

[More information](https://janjorka.github.io/jsonpath-tools/documentation/core/get-started)