import { LoadableRegistry } from '../../loadable';
import type { DebugLogRecord, DebugLogsState } from './types';

export function createDebugLogsState(): DebugLogsState {
  return {
    debugLogs: new LoadableRegistry<DebugLogRecord>(),
  };
}
