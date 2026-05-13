# @rule/test-describe-structure

Checks describe calls for the configured name prefix and nesting policy.

## default config

```json
{
  "@rule/test-describe-structure": {
    "describeNamePrefix": "feature: ",
    "allowNestedDescribe": false
  }
}
```

## failing code example

```ts
describe('ExampleService', () => {
  describe('nested', () => {});
});
```

## passing code example

```ts
describe('feature: example behavior', () => {});
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/test-describe-structure": {
      "describeNamePrefix": "feature: ",
      "allowNestedDescribe": false
    }
  }
}
```
