import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type UpdateAppSettingsOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'updateAppSettings'>;
type UpdateAppSettingsPayload = UpdateAppSettingsOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: UpdateAppSettingsPayload) {
    const settings = await ctx.datastore.appSettings.update(payload);
    ctx.events.emit('appSettingsUpdated', settings);
    return settings;
  };
}
