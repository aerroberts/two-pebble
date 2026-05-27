import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type DeleteKnownIdeOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'deleteKnownIde'>;
type DeleteKnownIdePayload = DeleteKnownIdeOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: DeleteKnownIdePayload) {
    const settings = await ctx.datastore.appSettings.read({});
    const deleted = await ctx.datastore.knownIdes.delete({ id: payload.id });
    ctx.events.emit('knownIdeDeleted', deleted);

    if (settings.defaultKnownIdeId === payload.id) {
      const updatedSettings = await ctx.datastore.appSettings.update({ ...settings, defaultKnownIdeId: null });
      ctx.events.emit('appSettingsUpdated', updatedSettings);
    }

    return deleted;
  };
}
