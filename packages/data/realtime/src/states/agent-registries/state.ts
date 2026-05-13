import { LoadableRegistry } from '../../loadable';
import type { AgentRegistriesState, AgentRegistryRecord } from './types';

export function createAgentRegistriesState(): AgentRegistriesState {
  return {
    agentRegistries: new LoadableRegistry<AgentRegistryRecord>(),
  };
}
