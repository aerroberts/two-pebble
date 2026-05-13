import type { CreateIntegrationInput } from '../states/integrations/types';
import type { RealtimeOperationContext } from '../types';

export function createIntegrationOperation(ctx: RealtimeOperationContext) {
  return async function createIntegration(payload: CreateIntegrationInput) {
    return ctx.datastore.emit('createIntegration', payload);
  };
}
