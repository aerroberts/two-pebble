import { LoadingPage, NotConnectedPage, ThemeLoader, TooltipProvider, useToast } from '@two-pebble/components';
import { RealtimeDaemonConnection } from '@two-pebble/realtime';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AppErrorBoundary } from './app-error-boundary';

const FALLBACK_DAEMON_URL = 'ws://127.0.0.1:49152';

function resolveDaemonUrl(): string {
  const override = import.meta.env.VITE_DAEMON_URL as string | undefined;
  if (override !== undefined && override.length > 0) return override;
  if (typeof window === 'undefined') return FALLBACK_DAEMON_URL;
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${window.location.host}`;
}

export function RealtimeApp() {
  const toaster = useToast();

  return (
    <>
      <ThemeLoader />
      <RealtimeDaemonConnection
        loading={<LoadingPage />}
        notConnected={<NotConnectedPage />}
        onOperationError={(input) => {
          console.error('Realtime operation failed', {
            error: input.error,
            message: input.error.message,
            operation: input.operation,
          });
          toaster.toast(`Operation ${input.operation} failed. Check logs for details.`, 'error');
        }}
        url={resolveDaemonUrl()}
      >
        <TooltipProvider>
          <AppErrorBoundary>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AppErrorBoundary>
        </TooltipProvider>
      </RealtimeDaemonConnection>
    </>
  );
}
