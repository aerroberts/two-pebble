# @two-pebble/datatypes

The shared domain type vocabulary for Two Pebble. It owns the cross-package
contracts — integrations, inference profiles, agent registries, projects,
workspaces, documents (TipTap content, comments, todos, references), app
settings, known IDEs, and third-party agent installs. It is types only: no
runtime classes or functions, so importing it adds nothing to a bundle.

Use this package as the single source of truth for these shapes; depend on it
from any package that speaks the daemon protocol.

## Usage

```ts
import type { Integration, InferenceProfile, IdeKind } from '@two-pebble/datatypes';

// Discriminated unions model each domain concept.
function describe(integration: Integration): string {
  switch (integration.provider) {
    case 'openai':
      return 'OpenAI integration';
    default:
      return `${integration.provider} integration`;
  }
}

const ide: IdeKind = 'vscode';

function isSpeech(profile: InferenceProfile): boolean {
  return profile.kind === 'speech';
}
```

## What's inside

Each domain is a folder of types re-exported from the package root:

- **integrations** / **inference-profiles** — provider unions plus a `protocol/` of pure interfaces.
- **agent-registries**, **projects**, **workspaces** — registry and project shapes.
- **documents** — TipTap content, comments, todos, and references.
- **app-settings**, **known-ide**, **third-party-agent-installs** — environment and install records.
