import type { CreateAutomationInput } from '../states/automations/types';
import type { RealtimeOperationContext } from '../types';

export function createAutomationOperation(ctx: RealtimeOperationContext) {
  return async function createAutomation(payload: CreateAutomationInput) {
    return ctx.datastore.emit('createAutomation', payload);
  };
}
