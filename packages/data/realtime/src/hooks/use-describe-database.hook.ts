'use client';

import type { ClientProtocol } from '@two-pebble/protocol';
import type { ProtocolOpByName, ProtocolOutboundOps } from '@two-pebble/ws-bridge';
import { useCallback, useEffect, useState } from 'react';
import { useRealtimeDatastore } from './use-realtime-datastore.hook';

export type DatabaseDescription = ProtocolOpByName<ProtocolOutboundOps<ClientProtocol>, 'describeDatabase'>['response'];

export type DatabaseDescriptionLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseDescribeDatabaseResult {
  description: DatabaseDescription | null;
  refresh: () => void;
  status: DatabaseDescriptionLoadStatus;
}

export function useDescribeDatabase(): UseDescribeDatabaseResult {
  const datastore = useRealtimeDatastore();
  const [refreshToken, setRefreshToken] = useState(0);
  const [state, setState] = useState<Omit<UseDescribeDatabaseResult, 'refresh'>>({
    description: null,
    status: 'idle',
  });
  const refresh = useCallback(() => setRefreshToken((value) => value + 1), []);

  useEffect(() => {
    void refreshToken;
    let active = true;
    setState((current) => ({ description: current.description, status: 'loading' }));

    void datastore.database
      .describe()
      .then((description) => {
        if (active) {
          setState({ description, status: 'ready' });
        }
      })
      .catch(() => {
        if (active) {
          setState({ description: null, status: 'error' });
        }
      });

    return () => {
      active = false;
    };
  }, [datastore, refreshToken]);

  return { ...state, refresh };
}
