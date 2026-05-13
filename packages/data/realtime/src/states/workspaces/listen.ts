import type { RealtimeOperationContext } from '../../types';

export function listenToWorkspaces(ctx: RealtimeOperationContext) {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('workspaceUpdated', (workspace) => {
    ctx.datastore.patch({
      workspaces: ctx.datastore.state.workspaces.withItem(workspace.id, workspace, 'ready'),
    });
  });
}
