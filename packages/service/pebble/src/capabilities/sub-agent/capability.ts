import type { AgentSignal } from '../../agent';
import { ToolResponse } from '../../agent';
import { Cell } from '../../thread';
import { AgentCapability } from '../agent-capability';
import nextActionGuidePrompt from './prompts/next-action-guide.md?raw';
import systemPrompt from './prompts/system.md?raw';
import { buildKillSubAgentTool } from './tools/kill-sub-agent/handler';
import { buildSendAgentTool } from './tools/send-agent/handler';
import { buildSpawnSubAgentTool } from './tools/spawn-sub-agent/handler';
import { buildWaitForAgentsTool } from './tools/wait-for-agents/handler';
import { childStatusLine } from './utils/sub-agent-cells';
import { readReferences } from './utils/sub-agent-references';
import { objectData, stringField } from './utils/sub-agent-signal-data';
import type {
  ChildLifecycle,
  ChildRecord,
  ChildResultStatus,
  ParentSignalInput,
  SendAgentInput,
  SpawnSubAgentInput,
  SubAgentCapabilityConfig,
  SubAgentReference,
  WaitForAgentsInput,
} from './utils/sub-agent-types';

/**
 * Capability installed on parent agents so they can manage child agents.
 * It owns child references, durable child messaging, and fan-in waits.
 */
export class SubAgentCapability extends AgentCapability<SubAgentCapabilityConfig> {
  public readonly id = 'sub-agent';
  public readonly description = 'Lets a Pebble agent launch and coordinate child agents.';
  private readonly childrenSlot = this.useState<ChildRecord[]>('children', []);
  private referencesValue: SubAgentReference[] = [];

  public override hookBeforeAgentTurn(): void {
    const children = this.childrenSlot.value;
    if (children.length === 0) {
      return;
    }
    const lines = children.map((child) => `- ${childStatusLine(child)}`);
    this.agent.addUserContext('Sub-agent Status', [
      Cell.header2('Sub-agent Status'),
      Cell.text(lines.join('\n')),
      Cell.text(nextActionGuidePrompt),
    ]);
  }

  public override hookOnRegister(config: SubAgentCapabilityConfig) {
    this.referencesValue = readReferences(config);
    return {
      system: systemPrompt,
      tools: [
        buildSpawnSubAgentTool(this),
        buildSendAgentTool(this),
        buildWaitForAgentsTool(this),
        buildKillSubAgentTool(this),
      ],
    };
  }

  public references(): SubAgentReference[] {
    return this.referencesValue;
  }

  public async spawnSubAgent(input: SpawnSubAgentInput) {
    if (this.childrenSlot.value.some((child) => child.name === input.name)) {
      return ToolResponse.error(`Child agent name already exists: ${input.name}`, [
        Cell.text(`Child agent name already exists: ${input.name}`),
      ]);
    }
    this.requireReference(input.subAgentId);
    const childAgentId = await this.bridge.subAgents.spawn(input);
    const child: ChildRecord = {
      agentId: childAgentId,
      lifecycle: 'running',
      mode: input.mode,
      name: input.name,
      subAgentId: input.subAgentId,
    };
    this.childrenSlot.set([...this.childrenSlot.value, child]);
    await this.sendChildInstructions({ child, instructions: input.instructions });
    this.traceSubAgentInvoke(child.agentId, child.subAgentId, input.instructions);
    return ToolResponse.success([Cell.text(`Spawned ${input.name} (${childAgentId}).`)]);
  }

  public async sendAgent(input: SendAgentInput) {
    const child = this.requireChild(input.name);
    if (child.lifecycle === 'killed' || child.lifecycle === 'completed' || child.lifecycle === 'failed') {
      return ToolResponse.error(`Child agent ${input.name} is terminal.`, [
        Cell.text(`Child agent ${input.name} is terminal.`),
      ]);
    }
    await this.sendChildInstructions({ child, instructions: input.instructions });
    this.updateChild(input.name, { lifecycle: 'running', resultMessage: undefined, resultStatus: undefined });
    return ToolResponse.success([Cell.text(`Sent instructions to ${input.name}.`)]);
  }

  public async waitForAgents(input: WaitForAgentsInput) {
    const pending: string[] = [];
    for (const name of input.names) {
      const child = this.requireChild(name);
      if (child.resultStatus !== undefined || isTerminal(child.lifecycle)) {
        continue;
      }
      if (child.pendingWaitSignalId !== undefined) {
        pending.push(name);
        continue;
      }
      const signalId = await this.registerSignal({
        description: `Wait for sub-agent ${name} (${child.agentId}) to respond.`,
        name: 'Sub-agent result',
      });
      this.updateChild(name, { pendingWaitSignalId: signalId });
      pending.push(name);
    }
    if (pending.length === 0) {
      return ToolResponse.success([Cell.text('All requested child agents already have results.')]);
    }
    return ToolResponse.success([Cell.text(`Waiting for child agents: ${pending.join(', ')}.`)]);
  }

  public async killSubAgent(input: { name: string; reason: string }) {
    const child = this.requireChild(input.name);
    await this.bridge.subAgents.kill({ childAgentId: child.agentId, reason: input.reason });
    this.updateChild(input.name, { lifecycle: 'killed' });
    return ToolResponse.success([Cell.text(`Stopped ${input.name}.`)]);
  }

  public override hookOnSignal(signal: AgentSignal): void {
    const data = objectData(signal.data);
    if (stringField(data, 'type') !== 'sub-agent-result') {
      return;
    }
    const childAgentId = stringField(data, 'childAgentId');
    const childName = stringField(data, 'childName');
    const message = stringField(data, 'message');
    const status = resultStatus(data);
    if (childAgentId === undefined || childName === undefined || message === undefined || status === undefined) {
      return;
    }
    const child = this.childrenSlot.value.find((item) => item.name === childName || item.agentId === childAgentId);
    if (child === undefined) {
      return;
    }
    const childResponseSignalId = stringField(data, 'childResponseSignalId');
    const lifecycle = lifecycleForResult(status);
    this.updateChild(child.name, {
      childResponseSignalId,
      lifecycle,
      pendingWaitSignalId: undefined,
      resultMessage: message,
      resultStatus: status,
    });
    if (status === 'failure') {
      this.agent.emit('trace', {
        type: 'sub-agent-failure',
        data: {
          agentInstanceId: childAgentId,
          error: message,
          output: [Cell.text(message)],
        },
      });
    } else {
      this.agent.emit('trace', {
        type: 'sub-agent-success',
        data: {
          agentInstanceId: childAgentId,
          output: [Cell.text(message)],
        },
      });
    }
    this.agent.addUserContext('Sub-agent Result', [
      Cell.header2(`Sub-agent Result: ${child.name}`),
      Cell.text(`${status}: ${message}`),
    ]);
  }

  private async sendChildInstructions(input: { child: ChildRecord; instructions: string }): Promise<void> {
    const data = {
      instructions: input.instructions,
      parentAgentId: this.agent.agentId,
      parentCapabilityId: this.id,
      type: 'parent-instructions',
    };
    const signalId = input.child.childResponseSignalId;
    if (signalId !== undefined) {
      await this.bridge.signals.resolve({
        agentId: input.child.agentId,
        capabilityId: capabilityIdForMode(input.child.mode),
        data,
        signalId,
      });
      this.updateChild(input.child.name, { childResponseSignalId: undefined });
      return;
    }
    await this.sendParentSignal({
      childAgentId: input.child.agentId,
      data,
      description: `Parent sent instructions to ${input.child.name}.`,
      name: 'Parent instructions',
    });
  }

  private traceSubAgentInvoke(childAgentId: string, subAgentId: string, instructions: string): void {
    this.agent.emit('trace', {
      type: 'sub-agent-invoke',
      data: {
        agentInstanceId: childAgentId,
        agentTemplateId: subAgentId,
        input: [Cell.text(instructions)],
      },
    });
  }

  private requireReference(subAgentId: string): void {
    if (!this.referencesValue.some((reference) => reference.name === subAgentId)) {
      throw new Error(`Unknown sub-agent id: ${subAgentId}`);
    }
  }

  private requireChild(name: string): ChildRecord {
    const child = this.childrenSlot.value.find((item) => item.name === name);
    if (child === undefined) {
      throw new Error(`Unknown child agent name: ${name}`);
    }
    return child;
  }

  private updateChild(name: string, patch: Partial<ChildRecord>): void {
    this.childrenSlot.set(
      this.childrenSlot.value.map((child) => (child.name === name ? { ...child, ...patch } : child)),
    );
  }

  private async sendParentSignal(input: ParentSignalInput): Promise<void> {
    await this.bridge.signals.send({
      agentId: input.childAgentId,
      capabilityId: capabilityIdForMode(this.requireChildByAgentId(input.childAgentId).mode),
      data: input.data,
      description: input.description,
      name: input.name,
    });
  }

  private requireChildByAgentId(agentId: string): ChildRecord {
    const child = this.childrenSlot.value.find((item) => item.agentId === agentId);
    if (child === undefined) {
      throw new Error(`Unknown child agent id: ${agentId}`);
    }
    return child;
  }
}

function capabilityIdForMode(mode: 'task' | 'teammate'): string {
  return mode === 'task' ? 'parent-linked-task' : 'parent-linked-teammate';
}

function isTerminal(lifecycle: ChildLifecycle): boolean {
  return lifecycle === 'completed' || lifecycle === 'failed' || lifecycle === 'killed';
}

function lifecycleForResult(status: ChildResultStatus): ChildLifecycle {
  if (status === 'success') {
    return 'completed';
  }
  if (status === 'failure') {
    return 'failed';
  }
  return 'waiting-for-parent';
}

function resultStatus(data: ReturnType<typeof objectData>): ChildResultStatus | undefined {
  const status = stringField(data, 'status');
  if (status === 'failure' || status === 'response' || status === 'success') {
    return status;
  }
  return undefined;
}
