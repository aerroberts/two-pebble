import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import { DataSyncService } from '../services/data-sync';
import type { DaemonHandlerContext } from '../types';

type BuildPlanOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'buildDataSyncPlan'>;
type BuildPlanPayload = BuildPlanOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  const service = new DataSyncService(ctx.datastore);
  return async function wrappedHandler(payload: BuildPlanPayload) {
    return service.buildPlan({
      direction: payload.direction,
      directory: payload.directory,
      projectNames: payload.projectNames,
    });
  };
}
