import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import { DataSyncService } from '../services/data-sync';
import type { DaemonHandlerContext } from '../types';

type ApplyOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'applyDataSyncPlan'>;
type ApplyPayload = ApplyOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  const service = new DataSyncService(ctx.datastore);
  return async function wrappedHandler(payload: ApplyPayload) {
    return service.apply(payload.plan);
  };
}
