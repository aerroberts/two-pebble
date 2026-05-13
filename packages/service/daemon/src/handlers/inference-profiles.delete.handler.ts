import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type DeleteInferenceProfileOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'deleteInferenceProfile'>;
type DeleteInferenceProfilePayload = DeleteInferenceProfileOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: DeleteInferenceProfilePayload) {
    const deleted = await ctx.datastore.inferenceProfiles.delete({ id: payload.id });
    ctx.multicastBridge.emit('inferenceProfileDeleted', deleted);
    return deleted;
  };
}
