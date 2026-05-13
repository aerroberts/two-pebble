import type { RealtimeOperationContext } from '../types';

export interface RenameAgentInput {
  id: string;
  name: string;
}

export function renameAgentOperation(ctx: RealtimeOperationContext) {
  return async function renameAgent(input: RenameAgentInput) {
    return ctx.datastore.emit('renameAgent', input);
  };
}
