import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { readDebugLogContent } from '../utils/debug-logs/debug.logs.file';

type ReadDebugLogOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'readDebugLog'>;
type ReadDebugLogPayload = ReadDebugLogOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ReadDebugLogPayload) {
    return readDebugLogContent(ctx.logsDirectoryPath, payload.id);
  };
}
