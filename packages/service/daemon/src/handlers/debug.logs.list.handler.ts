import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { listDebugLogFiles } from '../utils/debug-logs/debug.logs.file';

type ListDebugLogsOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listDebugLogs'>;
type ListDebugLogsPayload = ListDebugLogsOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ListDebugLogsPayload) {
    const limit = payload.limit ?? 50;
    const offset = payload.offset ?? 0;
    const files = listDebugLogFiles(ctx.logsDirectoryPath);
    return {
      items: files.slice(offset, offset + limit),
      page: {
        limit,
        offset,
        total: files.length,
      },
    };
  };
}
