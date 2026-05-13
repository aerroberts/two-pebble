import type { DetectClaudeCodeResult } from '../states/third-party-agent-installs/detect-claude-code-result';
import type { RealtimeOperationContext } from '../types';

export function detectClaudeCodeInstallOperation(ctx: RealtimeOperationContext) {
  return async function detectClaudeCodeInstall(): Promise<DetectClaudeCodeResult> {
    return ctx.datastore.emit('detectClaudeCodeInstall', {});
  };
}
