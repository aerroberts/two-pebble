import fs from 'node:fs/promises';
import { createTableId } from '@two-pebble/datastore';
import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { seedIndex } from '../utils/memories/memory-files';
import { buildMemoryPath } from '../utils/memories/memory-paths';

type CreateMemoryOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'createMemory'>;
type CreateMemoryPayload = CreateMemoryOperation['request'];

/**
 * Creates a memory collection in a single step: the handler pre-generates
 * the id, computes the folder path, writes the row, then creates the
 * folder and seeds `index.md`. Because `path` is stored, no create-then-
 * update dance is needed. The index-exists invariant is true at birth.
 */
export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: CreateMemoryPayload) {
    const id = createTableId('memories');
    const dir = buildMemoryPath(id);
    const memory = await ctx.datastore.memories.create({
      id,
      name: payload.name,
      path: dir,
      ...(payload.projectId === undefined ? {} : { projectId: payload.projectId }),
    });

    await fs.mkdir(dir, { recursive: true });
    await seedIndex(dir, memory.name);

    ctx.events.emit('memoryUpdated', memory);

    return memory;
  };
}
