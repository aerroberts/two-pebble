import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type MigrateDatabaseOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'migrateDatabase'>;
type MigrateDatabasePayload = MigrateDatabaseOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(_payload: MigrateDatabasePayload) {
    await ctx.datastore.migrate();
    return { migrated: true as const };
  };
}
