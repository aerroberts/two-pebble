# @two-pebble/ws-bridge

WebSocket Bridge is the typed operation and event transport used between the
daemon and browser clients. It provides an in-memory `Bridge`, plus Bun-backed
WebSocket server and browser WebSocket client wrappers.

Use this package when two processes need request/response operations and one-way
events over a small JSON protocol.

## Protocol

```ts
import type { BridgeProtocol } from '@two-pebble/ws-bridge';

interface ServerProtocol
  extends BridgeProtocol<
    { operations: [{ name: 'ping'; request: { value: number }; response: { value: number } }]; events: [] },
    { operations: []; events: [{ name: 'announce'; payload: string }] }
  > {}
```

## Server

```ts
import { WsBridgeServer } from '@two-pebble/ws-bridge';

const server = new WsBridgeServer<ServerProtocol>({ port: 7273 });

server.onClientConnected((bridge) => {
  bridge.on('ping', async (payload) => ({ value: payload.value + 1 }));
  bridge.emit('announce', 'client-connected');
});

await server.launch();
```

## Client

```ts
import { WsBridgeClient } from '@two-pebble/ws-bridge';

const client = new WsBridgeClient<ServerProtocol>({ url: 'ws://127.0.0.1:7273' });

await client.connect((bridge) => {
  bridge.listen('announce', (message) => console.log(message));
});

const response = await client.do('ping', { value: 41 });
console.log(response.value);
```
