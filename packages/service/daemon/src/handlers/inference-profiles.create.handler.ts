import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type CreateInferenceProfileOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'createInferenceProfile'>;
type CreateInferenceProfilePayload = CreateInferenceProfileOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: CreateInferenceProfilePayload) {
    const inferenceProfile = await ctx.datastore.inferenceProfiles.create(payload);
    ctx.multicastBridge.emit('inferenceProfileUpdated', inferenceProfile);
    return { id: inferenceProfile.id };
  };
}
