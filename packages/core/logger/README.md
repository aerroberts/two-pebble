# @two-pebble/logger

Logger provides the shared logging primitives for Two Pebble packages. It owns
structured log entries, async scope propagation, stdout sinks, memory sinks, and
file sinks used by the daemon.

Use it when code needs consistent lifecycle logs without binding itself to a
specific process or UI.

## Pretty Logs

```ts
import { Logger, StdoutSink } from '@two-pebble/logger';

const logger = new Logger(new StdoutSink({ output: process.stdout }));

logger.info('daemon started', { port: 7273 });
logger.warn('operation failed', { operation: 'integrations.list' });
```

## File Logs

```ts
import { FileSyncSink, Logger } from '@two-pebble/logger';

const logger = new Logger(new FileSyncSink({ filePath: './logs/dev.log' }));

logger.info('datastore operation', { operation: 'agent.create' });
```

## Scoped Logs

```ts
import { logger, scoped, scopeKeyRequired } from '@two-pebble/logger';

await scoped({ requestId: 'req-1' }, async () => {
  logger.info('handling request', { requestId: scopeKeyRequired('requestId') });
});
```
