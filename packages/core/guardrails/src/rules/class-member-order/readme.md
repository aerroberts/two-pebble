# @rule/class-member-order

Checks class member phases against memberOrder and maxConstructors.

## default config

```json
{
  "@rule/class-member-order": {
    "memberOrder": [
      "fields",
      "constructor",
      "accessors",
      "methods"
    ],
    "maxConstructors": 1
  }
}
```

## failing code example

```ts
class ExampleService {
  public run() {}
  private value = true;
}
```

## passing code example

```ts
class ExampleService {
  private value = true;
  public run() {}
}
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/class-member-order": {
      "memberOrder": [
        "fields",
        "constructor",
        "accessors",
        "methods"
      ],
      "maxConstructors": 1
    }
  }
}
```
