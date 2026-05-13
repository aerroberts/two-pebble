# @rule/documentation

Checks TypeScript statements matched by configured documentation rules and reports missing multiline JSDoc.

## default config

```json
{
  "@rule/documentation": {
    "statements": [
      {
        "match": "class",
        "minimumJSDocLines": 3
      },
      {
        "match": "publicClassMethod",
        "minimumJSDocLines": 3
      }
    ]
  }
}
```

## failing code example

```ts
export class ExampleClass {
  public readName() {
    return 'bad';
  }
}
```

## passing code example

```ts
/**
 * Owns the example class.
 * Provides a documented public method.
 */
export class ExampleClass {
  /**
   * Reads the example name.
   * Returns a stable string.
   */
  public readName() {
    return 'example';
  }
}
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/documentation": {
      "statements": [
        {
          "match": "class",
          "minimumJSDocLines": 3
        },
        {
          "match": "function",
          "minimumJSDocLines": 3
        }
      ]
    }
  }
}
```
