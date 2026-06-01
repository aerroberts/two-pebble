import type { AgentSignal } from '../../agent';
import { AgentExitHook } from '../../agent';
import { AgentCapability } from '../agent-capability';
import systemPrompt from './prompts/system.md?raw';
import { buildSubmitPrTool } from './tools/submit-pr/handler';

/**
 * Agent capability that submits pull requests for task deliverables and
 * reconciles their state from `pr-changed` signals delivered by the daemon.
 */
export class GithubCapability extends AgentCapability<Record<string, never>> {
  public readonly id = 'github';
  public readonly description = 'Tracks GitHub pull requests submitted for task deliverables.';

  public override hookOnRegister() {
    return {
      system: systemPrompt,
      tools: [buildSubmitPrTool(this)],
    };
  }

  public override async hookOnSignal(signal: AgentSignal): Promise<void> {
    if (signal.name !== 'pr-changed') {
      return;
    }
    const data = signal.data;
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      return;
    }
    const record = data as Record<string, unknown>;
    if (typeof record.prId !== 'string' || !isPrState(record.next)) {
      return;
    }
    await this.bridge.github.applySignal({ prId: record.prId, next: record.next });
  }

  public override async hookOnAgentExit() {
    const hasOpenPrs = await this.bridge.github.hasOpenPrs();
    if (!hasOpenPrs) {
      return AgentExitHook.permitExit();
    }
    return AgentExitHook.denyExit('Waiting for submitted GitHub PRs to merge, close, or become actionable.');
  }
}

function isPrState(value: unknown): value is 'mergeable' | 'pending' | 'unmergeable' | 'merged' | 'closed' {
  return (
    value === 'mergeable' || value === 'pending' || value === 'unmergeable' || value === 'merged' || value === 'closed'
  );
}
