import { LoadableRegistry } from '../../loadable';
import type { AgentTraceRecord, AgentTracesState } from './types';

export function createAgentTracesState(): AgentTracesState {
  return {
    agentTraces: new LoadableRegistry<AgentTraceRecord>(),
  };
}
