import type { RealtimeOperationContext } from '../../types';

export function listenToThirdPartyAgentInstalls(ctx: RealtimeOperationContext) {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('thirdPartyAgentInstallDeleted', (deleted) => {
    ctx.datastore.patch({
      thirdPartyAgentInstalls: ctx.datastore.state.thirdPartyAgentInstalls.withoutItem(deleted.id),
    });
  });
  client.listen('thirdPartyAgentInstallUpdated', (install) => {
    ctx.datastore.patch({
      thirdPartyAgentInstalls: ctx.datastore.state.thirdPartyAgentInstalls.withItem(install.id, install, 'ready'),
    });
  });
}
