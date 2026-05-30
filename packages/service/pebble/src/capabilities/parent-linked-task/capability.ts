import type { AgentSignal } from '../../agent';
import { AgentExitHook, ToolResponse } from '../../agent';
import { Cell } from '../../thread';
import { AgentCapability } from '../agent-capability';
import systemPrompt from './prompts/system.md?raw';
import { buildCompleteTool } from './tools/complete/handler';
import { buildFailureTool } from './tools/failure/handler';
import { objectData, stringField } from './utils/parent-linked-task-signal-data';
import type { ParentLinkedTaskCapabilityConfig } from './utils/parent-linked-task-types';

/**
 * Agent capability for a task child: exposes complete/fail tools so the child
 * can report the outcome of work its parent assigned, then settles into a
 * terminal state once it has reported.
 */
export class ParentLinkedTaskCapability extends AgentCapability<ParentLinkedTaskCapabilityConfig> {
  public readonly id = 'parent-linked-task';
  public readonly description = 'Lets a task child complete or fail work assigned by its parent.';
  private readonly parentAgentIdSlot = this.useState<string>('parent-agent-id', '');
  private readonly childNameSlot = this.useState<string>('child-name', '');
  private readonly terminalSlot = this.useState<boolean>('terminal', false);
  private readonly activeInstructionsSlot = this.useState<boolean>('active-instructions', false);

  public override initialize(config: ParentLinkedTaskCapabilityConfig): void {
    if (typeof config.parentAgentId === 'string') {
      this.parentAgentIdSlot.set(config.parentAgentId);
    }
    if (typeof config.childName === 'string') {
      this.childNameSlot.set(config.childName);
    }
  }

  public override hookOnRegister() {
    return {
      system: systemPrompt,
      tools: [buildCompleteTool(this), buildFailureTool(this)],
    };
  }

  public override hookOnSignal(signal: AgentSignal): void {
    const data = objectData(signal.data);
    if (stringField(data, 'type') !== 'parent-instructions') {
      return;
    }
    const instructions = stringField(data, 'instructions');
    if (instructions === undefined) {
      return;
    }
    this.activeInstructionsSlot.set(true);
    this.agent.addUserContext('Parent Task Instructions', [
      Cell.header2('Parent Task Instructions'),
      Cell.text(instructions),
    ]);
  }

  public override hookOnAgentExit() {
    if (this.terminalSlot.value || !this.activeInstructionsSlot.value) {
      return AgentExitHook.permitExit();
    }
    return AgentExitHook.denyExit('Complete or fail the parent-linked task before exiting.');
  }

  public async complete(message: string) {
    await this.sendResult('success', message);
    this.terminalSlot.set(true);
    this.activeInstructionsSlot.set(false);
    return ToolResponse.success([Cell.text('Completed task and sent result to parent.')]);
  }

  public async failure(message: string) {
    await this.sendResult('failure', message);
    this.terminalSlot.set(true);
    this.activeInstructionsSlot.set(false);
    return ToolResponse.success([Cell.text('Failed task and sent result to parent.')]);
  }

  private async sendResult(status: 'failure' | 'success', message: string): Promise<void> {
    await this.bridge.signals.send({
      agentId: this.parentAgentId(),
      capabilityId: 'sub-agent',
      data: {
        childAgentId: this.agent.agentId,
        childName: this.childName(),
        message,
        status,
        type: 'sub-agent-result',
      },
      description: `Task child ${this.childName()} reported ${status}.`,
      name: 'Sub-agent result',
    });
  }

  private parentAgentId(): string {
    const parentAgentId = this.parentAgentIdSlot.value;
    if (parentAgentId.length === 0) {
      throw new Error('parent-linked-task capability does not know its parent agent.');
    }
    return parentAgentId;
  }

  private childName(): string {
    const childName = this.childNameSlot.value;
    return childName.length === 0 ? this.agent.agentId : childName;
  }
}
