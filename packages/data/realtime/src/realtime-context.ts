import { createContext } from 'react';
import type { RealtimeDatastoreContextValue } from './types';

export const RealtimeContext = createContext<RealtimeDatastoreContextValue>(null);
