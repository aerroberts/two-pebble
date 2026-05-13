import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { getOpenFileCommand } from '../utils/files/open-file-command';

type OpenDebugLogsDirectoryOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'openDebugLogsDirectory'>;
type OpenDebugLogsDirectoryPayload = OpenDebugLogsDirectoryOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(_payload: OpenDebugLogsDirectoryPayload) {
    Bun.spawn({ cmd: getOpenFileCommand(ctx.logsDirectoryPath), stderr: 'ignore', stdout: 'ignore' });
    return { path: ctx.logsDirectoryPath };
  };
}
