import type { IdeKind } from '@two-pebble/datatypes';
import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { getIdeOpenCommand } from '../utils/ides/open-ide-command';

type OpenWorkspaceInIdeOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'openWorkspaceInIde'>;
type OpenWorkspaceInIdePayload = OpenWorkspaceInIdeOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: OpenWorkspaceInIdePayload) {
    const knownIde = await ctx.datastore.knownIdes.read({ id: payload.knownIdeId });
    Bun.spawn({
      cmd: getIdeOpenCommand(knownIde.kind as IdeKind, knownIde.executablePath, payload.workspacePath),
      stderr: 'ignore',
      stdout: 'ignore',
    });
    return {};
  };
}
