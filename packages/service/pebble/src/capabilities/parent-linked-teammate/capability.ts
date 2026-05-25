import type { AgentSignal } from '../../agent';
import { AgentExitHook, ToolResponse } from '../../agent';
import { Cell } from '../../thread';
import { AgentCapability } from '../agent-capability';
import systemPrompt from './prompts/system.md?raw';
import { buildRespondParentTool } from './tools/respond-parent/handler';
import { objectData, stringField } from './utils/parent-linked-teammate-signal-data';
import type { ParentLinkedTeammateCapabilityConfig } from './utils/parent-linked-teammate-types';

export class ParentLinkedTeammateCapability extends AgentCapability<ParentLinkedTeammateCapabilityConfig> {
  public readonly id = 'parent-linked-teammate';
  public readonly description = 'Lets a teammate child respond to its parent and wait for follow-up work.';
  private readonly parentAgentIdSlot = this.useState<string>('parent-agent-id', '');
  private readonly childNameSlot = this.useState<string>('child-name', '');
  private readonly activeInstructionsSlot = this.useState<boolean>('active-instructions', false);

  public override initialize(config: ParentLinkedTeammateCapabilityConfig): void {
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
      tools: [buildRespondParentTool(this)],
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
    this.agent.addUserContext('Parent Teammate Instructions', [
      Cell.header2('Parent Teammate Instructions'),
      Cell.text(instructions),
    ]);
  }

  public override hookOnAgentExit() {
    if (!this.activeInstructionsSlot.value) {
      return AgentExitHook.permitExit();
    }
    return AgentExitHook.denyExit('Respond to the parent before exiting.');
  }

  public async respondParent(message: string) {
    const nextParentSignalId = await this.registerSignal({
      description: 'Wait for parent follow-up instructions.',
      name: 'Parent teammate instructions',
    });
    await this.bridge.signals.send({
      agentId: this.parentAgentId(),
      capabilityId: 'sub-agent',
      data: {
        childAgentId: this.agent.agentId,
        childName: this.childName(),
        childResponseSignalId: nextParentSignalId,
        message,
        status: 'response',
        type: 'sub-agent-result',
      },
      description: `Teammate child ${this.childName()} responded to parent.`,
      name: 'Sub-agent result',
    });
    this.activeInstructionsSlot.set(false);
    return ToolResponse.success([Cell.text('Responded to parent and waiting for follow-up.')]);
  }

  private parentAgentId(): string {
    const parentAgentId = this.parentAgentIdSlot.value;
    if (parentAgentId.length === 0) {
      throw new Error('parent-linked-teammate capability does not know its parent agent.');
    }
    return parentAgentId;
  }

  private childName(): string {
    const childName = this.childNameSlot.value;
    return childName.length === 0 ? this.agent.agentId : childName;
  }
}
