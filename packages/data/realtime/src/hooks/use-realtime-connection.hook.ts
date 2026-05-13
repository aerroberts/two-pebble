'use client';

import { useContext } from 'react';
import { RealtimeConnectionContext } from '../realtime-connection-context';

export function useRealtimeConnection() {
  return useContext(RealtimeConnectionContext);
}
