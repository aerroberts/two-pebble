import fs from 'node:fs/promises';
import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { getOpenFileCommand } from '../utils/files/open-file-command';

type MemoryFolderOpenOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'openMemoryFolder'>;
type MemoryFolderOpenPayload = MemoryFolderOpenOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: MemoryFolderOpenPayload) {
    const memory = await ctx.datastore.memories.read({ id: payload.memoryId });
    await fs.mkdir(memory.path, { recursive: true });
    Bun.spawn({ cmd: getOpenFileCommand(memory.path), stderr: 'ignore', stdout: 'ignore' });
    return { path: memory.path };
  };
}
