# @rule/typescript-function-shape

Checks function parameter count, optional/default parameters, and complex signature types.

## default config

```json
{
  "@rule/typescript-function-shape": {
    "maxFunctionParameters": 3,
    "maxSimpleUnionMembers": 5,
    "allowOptionalParameters": false,
    "allowDefaultParameters": false,
    "allowComplexSignatureTypes": false
  }
}
```

## failing code example

```ts
function run(value?: string, fallback = 'x') {
  return value ?? fallback;
}
```

## passing code example

```ts
interface RunInput {
  value: string;
}
function run(input: RunInput) {
  return input.value;
}
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/typescript-function-shape": {
      "maxFunctionParameters": 3,
      "maxSimpleUnionMembers": 5,
      "allowOptionalParameters": false,
      "allowDefaultParameters": false,
      "allowComplexSignatureTypes": false
    }
  }
}
```
