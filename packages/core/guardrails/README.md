# @two-pebble/guardrails

Guardrails is the repository convention checker for Two Pebble. It is stricter
than a normal linter: it checks package shape, file naming, test structure, and
other architectural rules that keep agent-generated code predictable.

Use this package as a CLI from package scripts, or import the runner primitives
when a tool needs to execute guardrails programmatically.

## CLI

```bash
bun run guard
```

```json
{
  "scripts": {
    "guard": "bunx guardrails"
  }
}
```

## Programmatic Use

```ts
import { Controller } from '@two-pebble/guardrails';

const controller = new Controller();

const result = await controller.run(process.cwd(), {
  inherit: '@group/typescript',
});

console.log(result.passed);
```

## Custom Rule Shape

```ts
import { Guardrail } from '@two-pebble/guardrails';

export class MyRule extends Guardrail {
  public async check() {
    this.forEachFile((file) => {
      this.getReporter(file).error({
        message: 'Explain the specific convention being enforced.',
        recommendation: 'Explain how to fix the file and why this matters.',
      });
    });
  }
}
```
