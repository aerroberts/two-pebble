import { LoadableRegistry } from '../../loadable';
import type { AgentLivenessRecord, AgentLivenessState } from './types';

export function createAgentLivenessState(): AgentLivenessState {
  return {
    agentLiveness: new LoadableRegistry<AgentLivenessRecord>(),
    daemonBootId: null,
  };
}
