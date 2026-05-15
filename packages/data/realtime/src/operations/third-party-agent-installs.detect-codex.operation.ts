import type { DetectCodexResult } from '../states/third-party-agent-installs/detect-codex-result';
import type { RealtimeOperationContext } from '../types';

export function detectCodexInstallOperation(ctx: RealtimeOperationContext) {
  return async function detectCodexInstall(): Promise<DetectCodexResult> {
    return ctx.datastore.emit('detectCodexInstall', {});
  };
}
