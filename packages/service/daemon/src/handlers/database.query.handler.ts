import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type RunDatabaseQueryOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'runDatabaseQuery'>;
type RunDatabaseQueryPayload = RunDatabaseQueryOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: RunDatabaseQueryPayload) {
    return ctx.datastore.runQuery(payload.query);
  };
}
