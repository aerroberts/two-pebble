# @rule/typescript-re-export-only-file

Checks non-index TypeScript files and reports files that only re-export another module when disallowed.

## default config

```json
{
  "@rule/typescript-re-export-only-file": {
    "allowReExportOnlyFiles": false
  }
}
```

## failing code example

```ts
export { value } from './value';
```

## passing code example

```ts
export function readName(name: string) {
  return name;
}
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/typescript-re-export-only-file": {
      "allowReExportOnlyFiles": false
    }
  }
}
```
