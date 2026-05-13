import type { RealtimeOperationContext } from '../types';

export function readAppSettingsOperation(ctx: RealtimeOperationContext) {
  return async function readAppSettings() {
    if (ctx.datastore.state.appSettings.status === 'loading') {
      return;
    }
    ctx.datastore.patch({ appSettings: ctx.datastore.state.appSettings.withStatus('loading') });
    try {
      const settings = await ctx.datastore.emit('readAppSettings', {});
      ctx.datastore.patch({ appSettings: ctx.datastore.state.appSettings.withValue(settings) });
    } catch (error) {
      ctx.datastore.patch({ appSettings: ctx.datastore.state.appSettings.withStatus('error') });
      throw error;
    }
  };
}
