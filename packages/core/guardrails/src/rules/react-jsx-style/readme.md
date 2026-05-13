# @rule/react-jsx-style

Checks JSX attributes and reports configured bannedJsxAttributes.

## default config

```json
{
  "@rule/react-jsx-style": {
    "bannedJsxAttributes": [
      "className",
      "style"
    ]
  }
}
```

## failing code example

```ts
export function Panel() {
  return <div className="panel" />;
}
```

## passing code example

```ts
export function Panel() {
  return <PanelFrame />;
}
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/react-jsx-style": {
      "bannedJsxAttributes": [
        "className",
        "style"
      ]
    }
  }
}
```
