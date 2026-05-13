import type { LoadableRegistry } from '../../loadable';

export interface DebugLogsState {
  debugLogs: LoadableRegistry<DebugLogRecord>;
}

export interface DebugLogRecord {
  id: string;
  name: string;
  path: string;
  sizeBytes: number;
  updatedAtIso: string;
}

export interface DebugLogContent extends DebugLogRecord {
  content: string;
}

export type DebugLogContentLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface DebugLogInput {
  id: string;
}
