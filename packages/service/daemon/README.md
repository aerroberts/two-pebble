# @two-pebble/daemon

Daemon is the local backend process for Two Pebble. It owns the durable
datastore, launches a protocol-backed WebSocket server, writes debug logs, and
executes daemon-side handlers for integrations, agents, traces, and model calls.

Use this package to run the local service that the UI connects to.

## Start From The CLI

```bash
bun run --cwd packages/pebble/daemon dev
```

```bash
bun run dev
```

## Start Programmatically

```ts
import { TwoPebbleDaemon } from '@two-pebble/daemon';

const daemon = new TwoPebbleDaemon({
  databaseFilePath: './.data/two-pebble.sqlite',
  host: '127.0.0.1',
  logFilePath: `${process.env.HOME}/.two-pebble/logs/dev.log`,
  port: 7273,
});

await daemon.launch();
console.log(`daemon listening on ${daemon.hostname}:${daemon.port}`);
```

## Shutdown

```ts
process.on('SIGINT', async () => {
  await daemon.close();
  process.exit(0);
});
```
