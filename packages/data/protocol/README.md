# @two-pebble/protocol

Protocol defines the typed daemon bridge contract shared by the daemon,
realtime datastore, and UI. It contains operation and event interfaces only; it
does not open sockets or perform work.

Use this package whenever code needs to type a `WsBridgeClient`,
`WsBridgeServer`, or direct `Bridge` for the Two Pebble daemon API.

## Client Protocol

```ts
import type { ClientProtocol } from '@two-pebble/protocol';
import { WsBridgeClient } from '@two-pebble/ws-bridge';

const client = new WsBridgeClient<ClientProtocol>({
  url: 'ws://127.0.0.1:7273',
});

await client.connect((bridge) => {
  bridge.listen('integrationsUpdated', (integration) => {
    console.log(integration.id);
  });
});
```

## Operations

```ts
const page = await client.do('listIntegrations', {
  limit: 50,
});

await client.do('createIntegration', {
  data: {},
  name: '',
  provider: 'openai',
});

console.log(page.items.length);
```

## Daemon Protocol

```ts
import type { DaemonProtocol } from '@two-pebble/protocol';
import { WsBridgeServer } from '@two-pebble/ws-bridge';

const server = new WsBridgeServer<DaemonProtocol>({ port: 7273 });
await server.launch();
```
