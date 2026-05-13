import type { CreateAgentRegistryInput, CreateAgentRegistryResponse } from '../states/agent-registries/types';
import type { RealtimeOperationContext } from '../types';

export function createAgentRegistryOperation(ctx: RealtimeOperationContext) {
  return async function createAgentRegistry(payload: CreateAgentRegistryInput): Promise<CreateAgentRegistryResponse> {
    return ctx.datastore.emit('createAgentRegistry', payload);
  };
}
