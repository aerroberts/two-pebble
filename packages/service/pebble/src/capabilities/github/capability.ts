import type { AgentSignal } from '../../agent';
import { AgentExitHook, ToolResponse } from '../../agent';
import { Cell } from '../../thread';
import { AgentCapability } from '../agent-capability';
import systemPrompt from './prompts/system.md?raw';
import { buildSubmitPrTool } from './tools/submit-pr/handler';

type TrackedPrState = 'mergeable' | 'unmergeable' | 'merged' | 'closed';

interface TrackedPrSlotRecord {
  deliverableId: string;
  id: string;
  signalId: string;
  state: TrackedPrState;
  taskId: string;
  url: string;
}

interface PrChangedSignalData {
  type?: string;
  prId?: string;
  next?: TrackedPrState;
  url?: string;
}

export class GithubCapability extends AgentCapability<Record<string, never>> {
  public readonly id = 'github';
  public readonly description = 'Lets a Pebble agent submit and wait on GitHub pull requests.';
  private readonly prsSlot = this.useState<TrackedPrSlotRecord[]>('prs', []);

  public override hookOnRegister() {
    for (const pr of this.openPrs()) {
      void this.registerSignal({
        description: `Wait for GitHub PR ${pr.url} to change state.`,
        name: 'GitHub PR update',
        signalId: pr.signalId,
      }).catch(() => undefined);
    }
    return { system: systemPrompt, tools: [buildSubmitPrTool(this)] };
  }

  public async submitPr(input: { deliverableId: string; url: string }) {
    try {
      const result = await this.bridge.github.submitPr({
        agentId: this.agent.agentId,
        deliverableId: input.deliverableId,
        url: input.url,
      });
      await this.registerSignal({
        description: `Wait for GitHub PR ${input.url} to change state.`,
        name: 'GitHub PR update',
        signalId: result.signalId,
      });
      this.upsertPr({
        deliverableId: result.deliverableId,
        id: result.trackedPrId,
        signalId: result.signalId,
        state: 'mergeable',
        taskId: result.taskId,
        url: input.url,
      });
      return ToolResponse.success([Cell.text(`Submitted PR for task ${result.taskId}; waiting on GitHub updates.`)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return ToolResponse.error(message, [Cell.text(`Failed to submit PR: ${message}`)]);
    }
  }

  public override hookOnSignal(signal: AgentSignal): void {
    const data = signal.data as PrChangedSignalData;
    if (data === null || typeof data !== 'object' || data.type !== 'pr-changed') {
      return;
    }
    if (data.prId === undefined || data.next === undefined) {
      return;
    }
    const existing = this.prsSlot.value.find((pr) => pr.id === data.prId);
    if (existing === undefined) {
      return;
    }
    const next = {
      ...existing,
      id: data.prId,
      signalId: signal.signalId,
      state: data.next,
      url: data.url ?? this.prsSlot.value.find((pr) => pr.id === data.prId)?.url ?? '',
    };
    this.upsertPr(next);
    void this.applyPrTransition(next);
    this.agent.addUserContext('GitHub PR Update', [
      Cell.header2('GitHub PR Update'),
      Cell.text(`PR ${data.url ?? data.prId} is now ${data.next}.`),
    ]);
  }

  public override hookOnAgentExit() {
    const blocking = this.openPrs();
    if (blocking.length === 0) {
      return AgentExitHook.permitExit();
    }
    return AgentExitHook.denyExit(
      `Open GitHub PRs still require resolution before exit: ${blocking.map((pr) => pr.url).join(', ')}`,
    );
  }

  private openPrs(): TrackedPrSlotRecord[] {
    return this.prsSlot.value.filter((pr) => pr.state === 'mergeable' || pr.state === 'unmergeable');
  }

  private upsertPr(next: TrackedPrSlotRecord): void {
    const remaining = this.prsSlot.value.filter((pr) => pr.id !== next.id);
    this.prsSlot.set([...remaining, next]);
  }

  private async applyPrTransition(pr: TrackedPrSlotRecord): Promise<void> {
    if (pr.state === 'merged') {
      await this.bridge.taskBoards.submitDeliverable({
        agentId: this.agent.agentId,
        taskId: pr.taskId,
        deliverableId: pr.deliverableId,
        payload: { type: 'pr_url', url: pr.url },
      });
      await this.bridge.taskBoards.setOwnedTaskStatus({
        agentId: this.agent.agentId,
        taskId: pr.taskId,
        status: 'success',
        reason: 'auto: GitHub PR merged',
      });
      return;
    }
    if (pr.state === 'unmergeable' || pr.state === 'closed') {
      await this.bridge.taskBoards.setOwnedTaskStatus({
        agentId: this.agent.agentId,
        taskId: pr.taskId,
        status: 'working',
        reason: `auto: GitHub PR ${pr.state}`,
      });
    }
  }
}
