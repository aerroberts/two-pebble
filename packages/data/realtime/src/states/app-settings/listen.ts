import type { RealtimeOperationContext } from '../../types';

export function listenToAppSettings(ctx: RealtimeOperationContext) {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('appSettingsUpdated', (settings) => {
    ctx.datastore.patch({ appSettings: ctx.datastore.state.appSettings.withValue(settings) });
  });
}
