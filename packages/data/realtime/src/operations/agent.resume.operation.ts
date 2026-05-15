import type { ResumeAgentInput } from '../states/agents/types';
import type { RealtimeOperationContext } from '../types';

export function resumeAgentOperation(ctx: RealtimeOperationContext) {
  return async function resumeAgent(input: ResumeAgentInput) {
    return ctx.datastore.emit('resumeAgent', input);
  };
}
