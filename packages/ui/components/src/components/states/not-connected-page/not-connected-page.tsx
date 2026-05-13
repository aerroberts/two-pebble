'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { useEffect } from 'react';

import { TwoPebbleLogo } from '../../branding/two-pebble-logo/two-pebble-logo';
import { Icon } from '../../content/icon/icon';

export interface NotConnectedPageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title'> {
  details?: ReactNode;
  message?: ReactNode;
  scope?: 'contained' | 'viewport';
  title?: ReactNode;
  /** When true, suppresses the daemon-availability polling that hard-reloads on reconnect. */
  disableReloadOnReconnect?: boolean;
  /** URL polled to detect when the daemon comes back online. Defaults to the current page origin. */
  pollUrl?: string;
  /** Polling interval in milliseconds. Defaults to 2000. */
  pollIntervalMs?: number;
}

export function NotConnectedPage(props: NotConnectedPageProps) {
  const {
    details,
    message = 'The app could not connect to the local Two Pebble daemon. Start the daemon to continue.',
    scope = 'viewport',
    title = 'Daemon not connected',
    disableReloadOnReconnect = false,
    pollUrl,
    pollIntervalMs = 2000,
    ...rest
  } = props;

  useEffect(() => {
    if (disableReloadOnReconnect) return;
    if (typeof window === 'undefined') return;

    const target = pollUrl ?? window.location.origin;
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        await fetch(target, { cache: 'no-store', method: 'HEAD' });
        if (cancelled) return;
        window.location.reload();
        return;
      } catch {
        // Daemon still unreachable — try again.
      }
      if (!cancelled) {
        timeout = setTimeout(poll, pollIntervalMs);
      }
    };

    timeout = setTimeout(poll, pollIntervalMs);

    return () => {
      cancelled = true;
      if (timeout !== null) clearTimeout(timeout);
    };
  }, [disableReloadOnReconnect, pollUrl, pollIntervalMs]);

  const rootClassName =
    scope === 'contained'
      ? 'flex min-h-full items-center justify-center'
      : 'flex min-h-screen items-center justify-center bg-background px-6 py-10';

  return (
    <div className={rootClassName} {...rest}>
      <div className="w-full max-w-xl">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <TwoPebbleLogo size="large" />
          <h1 className="mt-6 flex items-center gap-2 text-lg tracking-[-0.02em] text-content">
            <Icon name="unlink" color="text-danger" />
            {title}
          </h1>
          <div className="mt-2 text-sm leading-6 text-content-muted">{message}</div>
          {details ? <div className="mt-8 w-full text-left">{details}</div> : null}
        </div>
      </div>
    </div>
  );
}
