# @jsonpath-tools/jsonpath-editor-react

[Documentation](https://janjorka.github.io/jsonpath-tools/documentation/editor/react-component) | [NPM Package](https://www.npmjs.com/package/@jsonpath-tools/jsonpath-editor-react)

Advanced JSONPath ([RFC 9535](https://datatracker.ietf.org/doc/rfc9535/)) editor for React.

## Quickstart

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

[More information](https://janjorka.github.io/jsonpath-tools/documentation/editor/react-component)