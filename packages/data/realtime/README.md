# @two-pebble/realtime

Realtime is the browser-side datastore for Two Pebble. It connects to the
daemon over the protocol WebSocket, stores state in Zustand, exposes React hooks,
and keeps UI state fresh through daemon events.

Use this package from React applications that need live daemon-backed data.

## Provider

```tsx
import { RealtimeDaemonConnection } from '@two-pebble/realtime';

export function Root() {
  return (
    <RealtimeDaemonConnection
      loading={<div>Connecting...</div>}
      notConnected={<div>Daemon is not connected.</div>}
      url="ws://127.0.0.1:7273"
    >
      <App />
    </RealtimeDaemonConnection>
  );
}
```

## Read State

```tsx
import { useIntegrations } from '@two-pebble/realtime';

export function IntegrationsList() {
  const integrations = useIntegrations();

  if (integrations.status === 'loading') return <div>Loading...</div>;

  return integrations.entries().map((item) => (
    <div key={item.value.id}>{item.value.name}</div>
  ));
}
```

## Run Operations

```tsx
import { useCreateIntegration } from '@two-pebble/realtime';

export function CreateOpenAiIntegration() {
  const createIntegration = useCreateIntegration();

  return (
    <button
      type="button"
      onClick={() => createIntegration({ provider: 'openai' })}
    >
      Create OpenAI
    </button>
  );
}
```
