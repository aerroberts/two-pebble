# @rule/react-function-parameter

Checks React function parameters and reports destructured object parameters unless explicitly allowed.

## default config

```json
{
  "@rule/react-function-parameter": {
    "allowDestructuredFunctionParameters": false
  }
}
```

## failing code example

```ts
export function UserPanel({ name }: UserPanelProps) {
  return <span>{name}</span>;
}
```

## passing code example

```ts
export function UserPanel(props: UserPanelProps) {
  return <span>{props.name}</span>;
}
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/react-function-parameter": {
      "allowDestructuredFunctionParameters": false
    }
  }
}
```
