import type { RealtimeOperationContext } from '../../types';

export function listenToRepositories(ctx: RealtimeOperationContext) {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('repositoryDeleted', (deleted) => {
    ctx.datastore.patch({ repositories: ctx.datastore.state.repositories.withoutItem(deleted.id) });
  });
  client.listen('repositoryUpdated', (repository) => {
    ctx.datastore.patch({
      repositories: ctx.datastore.state.repositories.withItem(repository.id, repository, 'ready'),
    });
  });
}
