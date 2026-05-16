# @two-pebble/guardrails

Guardrails is the repository convention checker for Two Pebble. It is stricter
than a normal linter: it checks package shape, file naming, test structure, and
other architectural rules that keep agent-generated code predictable.

Use this package as a CLI from package scripts, or import the runner primitives
when a tool needs to execute guardrails programmatically.

## usage example

Run the CLI from any workspace package that declares guardrails as a dev
dependency:

```bash
bun run guard
```

Wire it into `package.json`:

```json
{
  "scripts": {
    "guard": "guardrails"
  }
}
```

Drive the runner programmatically when a tool needs more than the CLI:

```typescript
import { Controller } from '@two-pebble/guardrails';

const controller = new Controller();

const result = await controller.run(process.cwd(), {
  inherit: 'guardrails-typescript',
});

console.log(result.passed);
```

Author a new assertion by dropping a file in `src/asserts/` that exports a
`validate` function and registering it in `src/run-asserts.ts`:

```typescript
import type { WorkspaceNode } from '@two-pebble/traversal';
import type { AssertOutcome } from '../types';

export function validate(nodes: WorkspaceNode[], expected: string): AssertOutcome {
  if (nodes.every((node) => node.type === expected)) {
    return { passed: true };
  }
  return { passed: false, description: `Expected every node to be ${expected}.` };
}
```
