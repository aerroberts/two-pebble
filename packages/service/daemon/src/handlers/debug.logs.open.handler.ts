import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { resolveDebugLogFilePath } from '../utils/debug-logs/debug.logs.file';
import { getOpenFileCommand } from '../utils/files/open-file-command';

type OpenDebugLogOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'openDebugLog'>;
type OpenDebugLogPayload = OpenDebugLogOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: OpenDebugLogPayload) {
    const filePath = resolveDebugLogFilePath(ctx.logsDirectoryPath, payload.id);
    Bun.spawn({ cmd: getOpenFileCommand(filePath), stderr: 'ignore', stdout: 'ignore' });
    return { id: payload.id };
  };
}
