import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { detectInstalledIdes } from '../utils/ides/detect-ides';

type DetectIdesOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'detectIdes'>;
type DetectIdesPayload = DetectIdesOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: DetectIdesPayload) {
    void payload;
    const [candidates, knownIdes] = await Promise.all([detectInstalledIdes(), ctx.datastore.knownIdes.list({})]);
    const knownExecutablePaths = new Set(knownIdes.items.map((knownIde) => knownIde.executablePath));

    return {
      candidates: candidates.filter((candidate) => !knownExecutablePaths.has(candidate.executablePath)),
    };
  };
}
