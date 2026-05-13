import type { RecordAgentCallInput } from '../states/agent-calls/types';
import type { RealtimeOperationContext } from '../types';

export function recordAgentCallOperation(ctx: RealtimeOperationContext) {
  return async function recordAgentCall(input: RecordAgentCallInput) {
    return ctx.datastore.emit('recordAgentCall', input);
  };
}
