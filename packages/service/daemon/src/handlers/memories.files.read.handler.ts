import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { readMemoryFile } from '../utils/memories/memory-files';

type MemoryFilesReadOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'readMemoryFile'>;
type MemoryFilesReadPayload = MemoryFilesReadOperation['request'];

/**
 * Reads a single file from a memory folder. Sandboxed to the row's stored
 * path; escape paths and missing files surface a clear error.
 */
export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: MemoryFilesReadPayload) {
    const memory = await ctx.datastore.memories.read({ id: payload.memoryId });
    const content = await readMemoryFile(memory.path, payload.file);
    return { content };
  };
}
