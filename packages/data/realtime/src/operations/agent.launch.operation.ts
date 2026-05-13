import type { LaunchAgentInput } from '../states/agents/types';
import type { RealtimeOperationContext } from '../types';

export function launchAgentOperation(ctx: RealtimeOperationContext) {
  return async function launchAgent(input: LaunchAgentInput) {
    return ctx.datastore.emit('launchAgent', input);
  };
}
