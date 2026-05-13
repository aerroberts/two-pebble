import type { LoadableRegistry } from '../../loadable';
import type { RealtimeEmitPayload, RealtimeEmitResponse } from '../../types';

export interface AgentRegistriesState {
  agentRegistries: LoadableRegistry<AgentRegistryRecord>;
}

export type AgentRegistryRecord = RealtimeEmitResponse<'listAgentRegistries'>['items'][number];
export type CreateAgentRegistryInput = RealtimeEmitPayload<'createAgentRegistry'>;
export type CreateAgentRegistryResponse = RealtimeEmitResponse<'createAgentRegistry'>;
export type UpdateAgentRegistryInput = RealtimeEmitPayload<'updateAgentRegistry'>;
export type DeleteAgentRegistryInput = RealtimeEmitPayload<'deleteAgentRegistry'>;
