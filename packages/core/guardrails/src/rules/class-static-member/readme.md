# @rule/class-static-member

Checks class declarations and reports static members when allowStaticMembers is false.

## default config

```json
{
  "@rule/class-static-member": {
    "allowStaticMembers": false
  }
}
```

## failing code example

```ts
class ExampleService {
  public static create() {
    return new ExampleService();
  }
}
```

## passing code example

```ts
class ExampleService {
  public create() {
    return true;
  }
}
```

## usage in code.guard example

```json
{
  "additional": {
    "@rule/class-static-member": {
      "allowStaticMembers": false
    }
  }
}
```
