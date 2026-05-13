'use client';

import { useEffect, useState } from 'react';
import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import type { DebugLogContent, DebugLogContentLoadStatus } from '../types';

export interface UseDebugLogContentResult {
  log: DebugLogContent | null;
  status: DebugLogContentLoadStatus;
}

export function useDebugLogContent(logId: string): UseDebugLogContentResult {
  const datastore = useRealtimeDatastore();
  const [state, setState] = useState<UseDebugLogContentResult>({ log: null, status: 'idle' });

  useEffect(() => {
    if (logId.length === 0) {
      setState({ log: null, status: 'idle' });
      return;
    }

    let active = true;
    setState({ log: null, status: 'loading' });

    void datastore.debug.logs
      .read({ id: logId })
      .then((log) => {
        if (active) {
          setState({ log, status: 'ready' });
        }
      })
      .catch(() => {
        if (active) {
          setState({ log: null, status: 'error' });
        }
      });

    return () => {
      active = false;
    };
  }, [datastore, logId]);

  return state;
}
