# @rule/indent

Checks TypeScript and TSX files against configured indentation depth limits for each file role.

## default config

```json
{
  "@rule/indent": {
    "files": {
      "typescriptFile": {
        "maxIndentLevel": 6,
        "spacesPerIndentLevel": 2
      },
      "reactFile": {
        "maxIndentLevel": 10,
        "spacesPerIndentLevel": 2
      }
    }
  }
}
```

## failing code example

```ts
export function readName(value: string) {
  if (value) {
    if (value.length > 1) {
      return value;
    }
  }
}
```

## passing code example

```ts
export function readName(value: string) {
  return value;
}
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/indent": {
      "files": {
        "typescriptFile": {
          "maxIndentLevel": 6,
          "spacesPerIndentLevel": 2
        }
      }
    }
  }
}
```
