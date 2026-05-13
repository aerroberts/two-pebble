# @rule/test-case-structure

Checks configured test calls for describe depth, test name prefixes, and callback length.

## default config

```json
{
  "@rule/test-case-structure": {
    "testCallNames": [
      "test",
      "it"
    ],
    "requiredDescribeDepth": 1,
    "allowedTestNamePrefixes": [
      "happy: ",
      "unhappy: ",
      "snapshot: "
    ],
    "maxTestLines": 12
  }
}
```

## failing code example

```ts
test('works', () => {
  expect(true).toBe(true);
});
```

## passing code example

```ts
describe('feature: example', () => {
  test('happy: works', () => {
    expect(true).toBe(true);
  });
});
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/test-case-structure": {
      "testCallNames": [
        "test",
        "it"
      ],
      "requiredDescribeDepth": 1,
      "allowedTestNamePrefixes": [
        "happy: ",
        "unhappy: ",
        "snapshot: "
      ],
      "maxTestLines": 12
    }
  }
}
```
