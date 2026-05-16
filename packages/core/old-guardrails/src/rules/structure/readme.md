# @rule/structure

Checks filesystem paths and translated AST nodes through traversal queries.

## default config

```json
{
  "@rule/structure": {
    "find": []
  }
}
```

## failing code example

```ts
export class ExampleService {}
```

Fails when the configured query expects the exported class to have a leading block comment.

## passing code example

```ts
/**
 * Documents the service.
 */
export class ExampleService {}
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/structure": {
      "find": [
        {
          "find": "src/**/*.ts/export/class",
          "assert": {
            "exists": true,
            "type": "token:class"
          },
          "traverse": [
            {
              "find": "$prev-sibling",
              "assert": {
                "type": "token:block-comment"
              }
            }
          ]
        }
      ]
    }
  }
}
```
