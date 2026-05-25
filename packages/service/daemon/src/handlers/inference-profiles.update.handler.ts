import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type UpdateInferenceProfileOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'updateInferenceProfile'>;
type UpdateInferenceProfilePayload = UpdateInferenceProfileOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: UpdateInferenceProfilePayload) {
    const inferenceProfile = await ctx.datastore.inferenceProfiles.update(payload);
    ctx.events.emit('inferenceProfileUpdated', inferenceProfile);
    return { id: inferenceProfile.id };
  };
}
