import { LoadableRegistry } from '../../loadable';
import type { AgentRecord, AgentsState } from './types';

export function createAgentsState(): AgentsState {
  return {
    agents: new LoadableRegistry<AgentRecord>(),
  };
}
