import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListInferenceProfilesOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listInferenceProfiles'>;
type ListInferenceProfilesPayload = ListInferenceProfilesOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ListInferenceProfilesPayload) {
    return ctx.datastore.inferenceProfiles.list({
      limit: payload.limit,
      offset: payload.offset,
    });
  };
}
