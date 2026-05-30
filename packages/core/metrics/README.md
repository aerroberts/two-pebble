# @two-pebble/metrics

A process-wide metric reporter. Emitted metrics are forwarded to a single
registered handler (your sink — logs, StatsD, OpenTelemetry, etc.); until a
handler is registered, metrics are dropped rather than buffered. `wrap` adds
duration/success/failure metrics around any function with no call-site changes.

Use the shared `metrics` singleton for app code, or construct an isolated
`Metrics` instance in tests.

## Usage

```ts
import { metrics, Metrics } from '@two-pebble/metrics';

// Point the shared collector at a sink.
metrics.onMetric((metric) => {
  console.log(metric.name, metric.value, metric.dimensions);
});

// Emit a metric directly.
metrics.emit('agent.launched', 1, { provider: 'openai' });

// Wrap a function so each call emits duration + success/failure metrics.
const fetchUser = metrics.wrap('user.fetch', async (id: string) => {
  return db.users.find(id);
});
await fetchUser('abc'); // emits user.fetch timing + outcome

// Isolated collector for a test, so global state stays clean.
const local = new Metrics();
local.onMetric(() => {});
```

## API

- `metrics` — the shared process-wide `Metrics` singleton.
- `onMetric(handler)` — register (or replace) the sink that consumes emitted metrics.
- `emit(name, value, dimensions?)` — emit a single metric.
- `wrap(name, fn, dimensions?)` — wrap a function so each call emits duration + outcome.
- `periodically(listener)` — emit snapshot metrics on an interval.
- `shutdown()` — stop timers and clear the handler (use in test teardown).
