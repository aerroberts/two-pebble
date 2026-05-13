# @two-pebble/app

App is the Two Pebble browser UI. It is a Vite React single-page application
that uses the component library for layout and the realtime package for daemon
state.

Use this package when developing the local UI.

## Run The App

```bash
bun run --cwd packages/ui/app dev
```

```bash
bun run dev
```

## App Root

```tsx
import { RealtimeDaemonConnection } from '@two-pebble/realtime';
import { LoadingPage, NotConnectedPage, ToastProvider } from '@two-pebble/components';

export function Root() {
  return (
    <ToastProvider>
      <RealtimeDaemonConnection
        loading={<LoadingPage />}
        notConnected={<NotConnectedPage title="Daemon not connected" />}
        url="ws://127.0.0.1:7273"
      >
        <App />
      </RealtimeDaemonConnection>
    </ToastProvider>
  );
}
```

## Settings Pages

```tsx
import { Button, Section } from '@two-pebble/components';

export function SettingsPage() {
  return (
    <Section title="Integrations">
      <Button leftIcon="plus" variant="secondary">Create integration</Button>
    </Section>
  );
}
```
