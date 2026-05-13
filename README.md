<p align="center">
  <img src="./assets/two-pebble-logo.svg" alt="Two Pebble logo" width="96" height="96" />
</p>

# Two Pebble

Two Pebble is the agentic orchestration of the future: a local-first daemon, CLI, and UI for coordinating agents, tools, tasks, and runtime state through one typed protocol.

The daemon owns the durable state and serves the browser UI. The CLI launches and talks to the daemon. The UI connects back over the same bridge, so every surface works from the same source of truth.

## Setup

Install dependencies:

```bash
bun install
```

Build the workspace and install the `peb` CLI:

```bash
bun run cli:install
```

Start Two Pebble:

```bash
peb run
```

`peb run` starts the daemon, serves the built UI, and opens it in your browser. By default it starts at `http://127.0.0.1:49152`; if that port is busy, the daemon moves upward to the next free port.

Use a specific starting port when needed:

```bash
peb run --port 49200
```

## What Runs Locally

- Daemon: the Bun process that owns state, WebSocket bridge handlers, agents, task boards, and metrics.
- UI: the built React app served by the daemon from the same host and port.
- Database: local SQLite files under `~/.two-pebble/data`.
- Logs: daemon logs under `~/.two-pebble/logs`.

## Development

Run the daemon and open the UI in development mode:

```bash
bun run dev
```

Run pieces directly:

```bash
bun run dev:daemon
bun run dev:ui
bun run dev:components
```

## Verification

```bash
bun run typecheck
bun run test
bun run guard
bun run build
```
