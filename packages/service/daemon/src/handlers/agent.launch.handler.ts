import { logger } from '@two-pebble/logger';
import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { resolveReferenceCells } from './resolve-document-reference-cells';

type LaunchAgentOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'launchAgent'>;
type LaunchAgentPayload = LaunchAgentOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: LaunchAgentPayload) {
    const cells =
      payload.cells === undefined || payload.cells.length === 0
        ? undefined
        : await resolveReferenceCells({
            cells: payload.cells,
            datastore: ctx.datastore,
            logger,
          });
    const extraCapabilities =
      typeof payload.sourceDocumentId === 'string' && payload.sourceDocumentId.length > 0
        ? [{ id: 'progressive-task-list', config: { documentId: payload.sourceDocumentId } }]
        : undefined;
    return ctx.agentRegistry.launch({
      agentRegistryId: payload.agentRegistryId,
      message: payload.message,
      ...(cells === undefined ? {} : { cells }),
      ...(extraCapabilities === undefined ? {} : { extraCapabilities }),
      ...(payload.workspaceOverride === undefined ? {} : { workspaceOverride: payload.workspaceOverride }),
    });
  };
}
