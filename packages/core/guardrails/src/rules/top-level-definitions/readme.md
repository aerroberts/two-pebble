# @rule/top-level-definitions

Checks TypeScript files against configured top-level statement policies for each file role.

## default config

```json
{
  "@rule/top-level-definitions": {
    "files": {
      "classFile": {
        "allowedTopLevelStatements": ["import", "class"]
      },
      "testFile": {
        "allowedTopLevelStatements": ["import", "describe"],
        "bannedNestedDefinitions": ["class", "function", "interface", "type"]
      },
      "indexFile": {
        "allowedTopLevelStatements": ["import", "export"]
      },
      "typesFile": {
        "allowedTopLevelStatements": ["import", "export", "interface", "type"]
      }
    }
  }
}
```

## failing code example

```ts
const helper = true;

export class ExampleClass {}
```

## passing code example

```ts
export class ExampleClass {}
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/top-level-definitions": {
      "files": {
        "classFile": {
          "allowedTopLevelStatements": ["import", "class"]
        }
      }
    }
  }
}
```
