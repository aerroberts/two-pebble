# @rule/definition-length

Checks configured definition and control-flow block kinds against max line counts.

## default config

```json
{
  "@rule/definition-length": {
    "excludeTestFiles": true,
    "definitions": [
      {
        "match": "classMember",
        "maxLines": 80
      },
      {
        "match": "function",
        "maxLines": 200
      },
      {
        "match": "ifStatement",
        "maxLines": 80
      },
      {
        "match": "tryBlock",
        "maxLines": 80
      },
      {
        "match": "catchBlock",
        "maxLines": 80
      }
    ]
  }
}
```

## failing code example

```ts
export function readName(name: string) {
  if (name.length > 0) {
    const next = name.trim();
    return next;
  }
  return name;
}
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
    "@rule/definition-length": {
      "definitions": [
        {
          "match": "classMember",
          "maxLines": 80
        },
        {
          "match": "ifStatement",
          "maxLines": 40
        }
      ]
    }
  }
}
```
