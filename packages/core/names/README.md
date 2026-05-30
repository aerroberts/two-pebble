# @two-pebble/names

Small helpers for generating friendly, human-readable names — agent names and
git branch names — plus the `pickRandom` primitive they are built on.

Use this package anywhere you need a memorable identifier instead of a raw UUID.

## Usage

```ts
import { generateAgentName, generateBranchName, pickRandom } from '@two-pebble/names';

// Adjective + human first name, e.g. "studious-bart".
const agent = generateAgentName();

// A branch-safe slug for a new piece of work.
const branch = generateBranchName();

// The underlying primitive — pick one element from a list.
const provider = pickRandom(['openai', 'anthropic', 'google'] as const);

console.log({ agent, branch, provider });
```

## API

- `generateAgentName()` — `adjective-name`, e.g. `studious-bart`.
- `generateBranchName()` — a branch-safe slug for a new piece of work.
- `pickRandom(list)` — return one element of `list`, preserving its element type.
