# @rule/code-structure

Checks configured file and directory structure rules recursively from the package root.
Rules with `where` narrow matched paths before child rules run. `moduleKind: "single-exported-function-module"` selects files with exactly one exported function value.

## default config

```json
{
  "@rule/code-structure": {
    "rules": []
  }
}
```

## failing code example

```ts
// code.guard
{
  "additional": {
    "@rule/code-structure": {
      "rules": [{ "match": "src/index.ts", "existence": "must-exist", "type": "must-be-file", "recommendation": "Expose the package surface." }]
    }
  }
}
// src/index.ts is missing
```

## passing code example

```ts
// src/index.ts
export { ExampleService } from './example-service';
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/code-structure": {
      "rules": [
        {
          "match": "src/components/**/*.tsx",
          "type": "must-be-file",
          "where": {
            "fileNameMatchesParentDirectory": true,
            "moduleKind": "single-exported-function-module"
          },
          "recommendation": "Public component modules should have stories.",
          "rules": [
            {
              "match": "{$name}.story.tsx",
              "existence": "must-exist",
              "type": "must-be-file",
              "recommendation": "Every public component module needs a sibling story."
            }
          ]
        }
      ]
    }
  }
}
```
