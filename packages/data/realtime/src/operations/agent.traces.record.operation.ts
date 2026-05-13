import type { RecordAgentTraceInput } from '../states/agent-traces/types';
import type { RealtimeOperationContext } from '../types';

export function recordAgentTraceOperation(ctx: RealtimeOperationContext) {
  return async function recordAgentTrace(input: RecordAgentTraceInput) {
    return ctx.datastore.emit('recordAgentTrace', input);
  };
}
