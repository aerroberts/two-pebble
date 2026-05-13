'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { RealtimeConnectionContext } from './realtime-connection-context';
import { RealtimeContext } from './realtime-context';
import { RealtimeDatastore } from './realtime-datastore';
import type { RealtimeConnectionState, RealtimeDaemonConnectionProps } from './types';

const RETRY_CONNECTION_IN_MS = 1000;
const emptyConnectionError = new Error('');

export function RealtimeDaemonConnection(props: RealtimeDaemonConnectionProps) {
  const datastoreRef = useRef<RealtimeDatastore | null>(null);
  const [connection, setConnection] = useState<RealtimeConnectionState>({
    error: emptyConnectionError,
    status: 'connecting',
  });

  if (datastoreRef.current === null) {
    datastoreRef.current = new RealtimeDatastore({
      url: props.url,
    });
  }

  datastoreRef.current.onClosed(() => {
    setConnection({ error: emptyConnectionError, status: 'not-connected' });
  });

  if (props.onOperationError !== undefined) {
    datastoreRef.current.onError(props.onOperationError);
  }

  const connectionValue = useMemo(() => connection, [connection]);

  useEffect(() => {
    const datastore = datastoreRef.current;
    if (datastore === null) {
      return;
    }

    let active = true;
    let retry: ReturnType<typeof setTimeout> | null = null;
    const connect = () => {
      void datastore
        .connect()
        .then(() => {
          if (active) {
            setConnection({ error: emptyConnectionError, status: 'connected' });
          }
        })
        .catch((error) => {
          if (!active) {
            return;
          }

          setConnection({ error, status: 'not-connected' });
          retry = setTimeout(connect, RETRY_CONNECTION_IN_MS);
        });
    };

    setConnection({ error: emptyConnectionError, status: 'connecting' });
    connect();
    return () => {
      active = false;
      if (retry !== null) {
        clearTimeout(retry);
      }
      datastore.disconnect();
    };
  }, []);

  const children =
    connection.status === 'connected'
      ? props.children
      : connection.status === 'not-connected'
        ? props.notConnected
        : props.loading;

  return (
    <RealtimeConnectionContext.Provider value={connectionValue}>
      <RealtimeContext.Provider value={datastoreRef.current}>{children}</RealtimeContext.Provider>
    </RealtimeConnectionContext.Provider>
  );
}
