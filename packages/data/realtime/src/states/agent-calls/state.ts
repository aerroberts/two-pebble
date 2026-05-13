import { LoadableRegistry } from '../../loadable';
import type { AgentCallRegistryRecord, AgentCallsState } from './types';

export function createAgentCallsState(): AgentCallsState {
  return {
    agentCalls: new LoadableRegistry<AgentCallRegistryRecord>(),
  };
}
