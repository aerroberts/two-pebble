# @rule/typescript-type-safety

Checks non-test TypeScript files for configured forbidden TypeScript syntax.

## default config

```json
{
  "@rule/typescript-type-safety": {
    "forbiddenSyntax": [
      "any",
      "unknown",
      "satisfies",
      "globalThis"
    ]
  }
}
```

## failing code example

```ts
const value: any = globalThis.document;
```

## passing code example

```ts
interface RuntimeDocument {
  title: string;
}
const value: RuntimeDocument = { title: 'ok' };
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/typescript-type-safety": {
      "forbiddenSyntax": [
        "any",
        "unknown",
        "satisfies",
        "globalThis"
      ]
    }
  }
}
```
