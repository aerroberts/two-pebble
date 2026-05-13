import type { RealtimeOperationContext } from '../types';

export function deleteRepositoryOperation(ctx: RealtimeOperationContext) {
  return ctx.datastore.wrapEmitLifecycle('deleteRepository', {
    before: (payload) => {
      const repository = ctx.datastore.state.repositories.getItem(payload.id)?.value;
      if (repository === undefined || repository === null) {
        return;
      }

      ctx.datastore.patch({
        repositories: ctx.datastore.state.repositories.withItem(payload.id, repository, 'loading'),
      });
    },
    error: (payload) => {
      const repository = ctx.datastore.state.repositories.getItem(payload.id)?.value;
      if (repository === undefined || repository === null) {
        return;
      }

      ctx.datastore.patch({
        repositories: ctx.datastore.state.repositories.withItem(payload.id, repository, 'ready'),
      });
    },
  });
}
