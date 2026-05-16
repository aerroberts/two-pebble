# @rule/test-const-order

Checks TypeScript test files and reports top-level const declarations after describe when disallowed.

## default config

```json
{
  "@rule/test-const-order": {
    "allowConstAfterDescribe": false
  }
}
```

## failing code example

```ts
describe('feature: example', () => {});
const value = true;
```

## passing code example

```ts
const value = true;
describe('feature: example', () => {});
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/test-const-order": {
      "allowConstAfterDescribe": false
    }
  }
}
```
