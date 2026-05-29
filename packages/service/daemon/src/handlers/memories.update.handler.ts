import fs from 'node:fs/promises';
import path from 'node:path';
import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { INDEX_FILE, seedIndex } from '../utils/memories/memory-files';
import { normalizeMemoryPath } from '../utils/memories/memory-paths';

type UpdateMemoryOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'updateMemory'>;
type UpdateMemoryPayload = UpdateMemoryOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: UpdateMemoryPayload) {
    const requestedPath = payload.path?.trim();
    const normalizedPath =
      requestedPath === undefined || requestedPath.length === 0 ? undefined : normalizeMemoryPath(requestedPath);
    const memory = await ctx.datastore.memories.update({
      ...payload,
      ...(normalizedPath === undefined ? {} : { path: normalizedPath }),
    });

    if (normalizedPath !== undefined) {
      await fs.mkdir(normalizedPath, { recursive: true });
      await seedIndexIfMissing(normalizedPath, memory.name);
    }

    ctx.events.emit('memoryUpdated', memory);

    return memory;
  };
}

async function seedIndexIfMissing(dir: string, name: string): Promise<void> {
  try {
    await fs.access(path.join(dir, INDEX_FILE));
  } catch {
    await seedIndex(dir, name);
  }
}
