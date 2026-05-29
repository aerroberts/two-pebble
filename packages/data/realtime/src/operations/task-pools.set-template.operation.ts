import type { SetTaskPoolTemplateInput } from '../states/tasks/types';
import type { RealtimeOperationContext } from '../types';

export function setTaskPoolTemplateOperation(ctx: RealtimeOperationContext) {
  return async function setTaskPoolTemplate(payload: SetTaskPoolTemplateInput) {
    return ctx.datastore.emit('setTaskPoolTemplate', payload);
  };
}
