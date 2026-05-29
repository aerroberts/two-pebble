import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { listMemoryFiles } from '../utils/memories/memory-files';

type MemoryFilesListOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listMemoryFiles'>;
type MemoryFilesListPayload = MemoryFilesListOperation['request'];

/**
 * Lists every file in a memory folder. Sandboxed to the row's stored path;
 * a missing folder surfaces a clear "folder missing" error.
 */
export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: MemoryFilesListPayload) {
    const memory = await ctx.datastore.memories.read({ id: payload.memoryId });
    try {
      const files = await listMemoryFiles(memory.path);
      return { files };
    } catch {
      throw new Error(`memory folder missing: ${memory.path}`);
    }
  };
}
