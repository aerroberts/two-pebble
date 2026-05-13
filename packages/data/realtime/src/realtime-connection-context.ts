import { createContext } from 'react';
import type { RealtimeConnectionContextValue } from './types';

export const RealtimeConnectionContext = createContext<RealtimeConnectionContextValue>({
  error: new Error(''),
  status: 'connecting',
});
