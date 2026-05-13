# @rule/test-hook

Checks TypeScript test files and reports calls in bannedHookNames.

## default config

```json
{
  "@rule/test-hook": {
    "bannedHookNames": [
      "beforeEach",
      "afterEach",
      "beforeAll",
      "afterAll"
    ]
  }
}
```

## failing code example

```ts
describe('feature: example', () => {
  beforeEach(() => {});
});
```

## passing code example

```ts
describe('feature: example', () => {
  test('happy: works', () => {
    const value = true;
    expect(value).toBe(true);
  });
});
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/test-hook": {
      "bannedHookNames": [
        "beforeEach",
        "afterEach",
        "beforeAll",
        "afterAll"
      ]
    }
  }
}
```
