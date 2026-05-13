import path from 'node:path';
import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { getOpenFileCommand } from '../utils/files/open-file-command';

type OpenDatabaseOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'openDatabase'>;
type OpenDatabasePayload = OpenDatabaseOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(_payload: OpenDatabasePayload) {
    const directoryPath = path.dirname(ctx.databaseFilePath);
    Bun.spawn({ cmd: getOpenFileCommand(directoryPath), stderr: 'ignore', stdout: 'ignore' });
    return { path: ctx.databaseFilePath };
  };
}
