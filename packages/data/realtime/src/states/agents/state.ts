import { LoadableRegistry } from '../../loadable';
import type { AgentQueuedMessageRecord, AgentRecord, AgentsState } from './types';

export function createAgentsState(): AgentsState {
  return {
    agentQueuedMessages: new LoadableRegistry<AgentQueuedMessageRecord>(),
    agents: new LoadableRegistry<AgentRecord>(),
  };
}
