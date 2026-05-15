import { LoadableRegistry } from '../../loadable';
import type { AutomationRecord, AutomationsState, HeartbeatRecord } from './types';

export function createAutomationsState(): AutomationsState {
  return {
    automations: new LoadableRegistry<AutomationRecord>(),
    heartbeats: new LoadableRegistry<HeartbeatRecord>(),
  };
}
