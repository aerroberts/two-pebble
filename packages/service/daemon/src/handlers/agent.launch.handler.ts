import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { resolveDocumentReferenceCells } from './resolve-document-reference-cells';

type LaunchAgentOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'launchAgent'>;
type LaunchAgentPayload = LaunchAgentOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: LaunchAgentPayload) {
    const cells =
      payload.cells === undefined || payload.cells.length === 0
        ? undefined
        : await resolveDocumentReferenceCells({
            cells: payload.cells,
            datastore: ctx.datastore,
            logger: ctx.logger,
          });
    return ctx.agentRegistry.launch({
      agentRegistryId: payload.agentRegistryId,
      message: payload.message,
      ...(cells === undefined ? {} : { cells }),
    });
  };
}
