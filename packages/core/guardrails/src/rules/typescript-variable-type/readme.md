# @rule/typescript-variable-type

Checks variable and class field annotations for complex inline types.

## default config

```json
{
  "@rule/typescript-variable-type": {
    "maxSimpleUnionMembers": 5,
    "allowComplexVariableTypes": false
  }
}
```

## failing code example

```ts
const value: { name: string } = { name: 'Ada' };
```

## passing code example

```ts
interface Value {
  name: string;
}
const value: Value = { name: 'Ada' };
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/typescript-variable-type": {
      "maxSimpleUnionMembers": 5,
      "allowComplexVariableTypes": false
    }
  }
}
```
