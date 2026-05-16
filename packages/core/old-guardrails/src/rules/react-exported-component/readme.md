# @rule/react-exported-component

Checks TSX exported function components for maxExportedFunctions and optional file-name matching.

## default config

```json
{
  "@rule/react-exported-component": {
    "maxExportedFunctions": 1,
    "enforceFileNameMatch": true
  }
}
```

## failing code example

```ts
// user-panel.tsx
export function WrongName() {
  return null;
}
```

## passing code example

```ts
// user-panel.tsx
export function UserPanel() {
  return null;
}
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/react-exported-component": {
      "maxExportedFunctions": 1,
      "enforceFileNameMatch": true
    }
  }
}
```
