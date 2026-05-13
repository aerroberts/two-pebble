# @rule/test-mock

Checks TypeScript test files and reports calls in bannedMockNames.

## default config

```json
{
  "@rule/test-mock": {
    "bannedMockNames": [
      "mock",
      "spy",
      "spyOn"
    ]
  }
}
```

## failing code example

```ts
describe('feature: example', () => {
  test('happy: works', () => {
    spyOn(object, 'run');
  });
});
```

## passing code example

```ts
describe('feature: example', () => {
  test('happy: works through behavior', () => {
    expect(result).toBe(expected);
  });
});
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/test-mock": {
      "bannedMockNames": [
        "mock",
        "spy",
        "spyOn"
      ]
    }
  }
}
```
