import { stat } from 'node:fs/promises';
import type { IdeKind } from '@two-pebble/datatypes';
import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type CreateKnownIdeOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'createKnownIde'>;
type CreateKnownIdePayload = CreateKnownIdeOperation['request'];

const validIdeKinds: IdeKind[] = ['vscode', 'zed', 'cursor', 'other'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: CreateKnownIdePayload) {
    if (!validIdeKinds.includes(payload.kind)) {
      throw new Error(`Unknown IDE kind: ${payload.kind}`);
    }

    try {
      await stat(payload.executablePath);
    } catch {
      throw new Error(`Executable path does not exist: ${payload.executablePath}`);
    }

    const knownIde = await ctx.datastore.knownIdes.create(payload);
    ctx.events.emit('knownIdeUpdated', knownIde);
    return knownIde;
  };
}
