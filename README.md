# Two Pebble

Headless Bun daemon plus a React SPA that connects to it over WebSocket. The daemon owns a local SQLite database (Drizzle on `bun:sqlite`) and speaks a typed bridge protocol; any client — browser, future native shell, CLI — connects via the same WebSocket transport.

## Workspace layout

```text
packages/core/guardrails    Vendored guardrails CLI (no longer an external dep)
packages/data/protocol      Zod schemas + transport-agnostic typed bridge
packages/data/datastore     Drizzle schema and bun:sqlite store
packages/ui/components      React component library developed through Storybook
packages/ui/app             React SPA, Zustand store, talks to daemon over WebSocket
packages/pebble/matrix      Vendored event protocol for agent / provider integrations
packages/pebble/daemon      Headless Bun process: owns datastore, hosts WebSocket
```

## Local development

In two terminals:

```bash
bun run dev:daemon
bun run dev:ui
```

Then open the daemon URL printed as `ui available at` (default `http://127.0.0.1:49152`). The SPA connects back to the same host by default. Override with `VITE_DAEMON_URL` to point at a remote daemon.

## Verification commands

```bash
bun install
bun run guard           # run guardrails across every package
bun run typecheck       # typecheck every package
bun run test            # run bun:test suites in every package
bun run test:coverage   # same as test, with line + function coverage tables
bun run proof           # spawn daemon, hit Ollama, persist + read back lm_calls
bun run --filter @two-pebble/components storybook
```

Each package ships its own `code.guard` that inherits a guardrails group:

- `@group/guardrails-typescript` for non-UI packages
- `@group/guardrails-react` for `@two-pebble/components` and `@two-pebble/app`
