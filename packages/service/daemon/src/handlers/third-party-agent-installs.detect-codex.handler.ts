import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { detectCodexExecutable } from '../utils/codex/detect-codex';

type DetectCodexInstallOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'detectCodexInstall'>;
type DetectCodexInstallPayload = DetectCodexInstallOperation['request'];

/**
 * Looks for `codex` on the local PATH and, on success, persists a new
 * third-party agent install row pointing at the resolved executable.
 * Multiple installs per machine are allowed (plan: "No UNIQUE constraint").
 * On failure no install is created and `detected: false` is returned so the
 * UI can surface a "not installed" state without further work.
 */
export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(_payload: DetectCodexInstallPayload) {
    void _payload;
    const executablePath = await detectCodexExecutable();
    if (executablePath.length === 0) {
      return { detected: false, executablePath: '', installId: '' };
    }

    const install = await ctx.datastore.thirdPartyAgentInstalls.create({
      data: { executablePath },
      frameworkId: 'codex',
      name: 'OpenAI Codex',
    });
    ctx.events.emit('thirdPartyAgentInstallUpdated', install);

    return { detected: true, executablePath, installId: install.id };
  };
}
