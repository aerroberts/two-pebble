# @rule/class-name

Checks class declaration names against classNamePattern and checks the file name against fileNameCase.

## default config

```json
{
  "@rule/class-name": {
    "classNamePattern": "^[A-Z][A-Za-z0-9]*$",
    "fileNameCase": "kebab-case"
  }
}
```

## failing code example

```ts
// bad-service.ts
class bad_service {}
```

## passing code example

```ts
// example-service.ts
class ExampleService {}
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/class-name": {
      "classNamePattern": "^[A-Z][A-Za-z0-9]*$",
      "fileNameCase": "kebab-case"
    }
  }
}
```
