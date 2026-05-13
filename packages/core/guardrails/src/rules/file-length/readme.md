# @rule/file-length

Checks TypeScript and TSX files against configured line-count limits for each file role.

## default config

```json
{
  "@rule/file-length": {
    "files": {
      "classFile": {
        "maxLines": 400
      },
      "typescriptFile": {
        "maxLines": 400
      },
      "reactFile": {
        "maxLines": 300
      }
    }
  }
}
```

## failing code example

```ts
export class ExampleClass {
  public readName() {
    return 'example';
  }
}
```

## passing code example

```ts
export class ExampleClass {}
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/file-length": {
      "files": {
        "classFile": {
          "maxLines": 400
        }
      }
    }
  }
}
```
