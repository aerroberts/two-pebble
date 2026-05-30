# @two-pebble/events

A minimal, fully typed event emitter that works unchanged in browser and server
bundles — it has no Node-only dependencies. Listener payloads are inferred from
an event map, so `emit` and `on` stay type-checked against each other.

Use this package wherever you need a small typed pub/sub without pulling in
Node's `EventEmitter`.

## Usage

```ts
import { Events } from '@two-pebble/events';

// Describe the events and their payload tuples.
type AgentEvents = {
  started: [agentId: string];
  message: [agentId: string, text: string];
};

const events = new Events<AgentEvents>();

// Payload types are inferred from the event map.
events.on('message', (agentId, text) => {
  console.log(`${agentId}: ${text}`);
});

// `once` auto-removes the listener after the first emit.
events.once('started', (agentId) => console.log(`${agentId} is up`));

events.emit('started', 'studious-bart');
events.emit('message', 'studious-bart', 'hello'); // returns true if any listener ran
```

## API

`Events<TEvents>` is generic over an event map; every method is type-checked against it:

- `on(event, listener)` — register a listener; returns `this` for chaining.
- `once(event, listener)` — register a listener removed after its first call.
- `off(event, listener)` — remove a listener; missing listeners are ignored.
- `emit(event, ...payload)` — dispatch to current listeners; returns whether any ran.
