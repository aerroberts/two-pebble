import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { writeMemoryFile } from '../utils/memories/memory-files';

type MemoryFilesWriteOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'writeMemoryFile'>;
type MemoryFilesWritePayload = MemoryFilesWriteOperation['request'];

/**
 * Writes a single file into a memory folder. Sandboxed to the row's stored
 * path; parent directories are created as needed. Re-emits `memoryUpdated`
 * so the row's `updatedAt` and any subscribers stay fresh.
 */
export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: MemoryFilesWritePayload) {
    const memory = await ctx.datastore.memories.read({ id: payload.memoryId });
    await writeMemoryFile(memory.path, payload.file, payload.body);

    const touched = await ctx.datastore.memories.update({ id: memory.id });
    ctx.events.emit('memoryUpdated', touched);

    return { file: payload.file };
  };
}
