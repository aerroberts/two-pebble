import type { AgentSignal, SubAgentRunner } from '../../agent';
import { ToolResponse } from '../../agent';
import { Cell } from '../../thread';
import { getAgentBridge } from '../agent-bridge';
import { AgentCapability } from '../agent-capability';
import lifecyclePrimerPrompt from './prompts/lifecycle-primer.md?raw';
import nextActionGuidePrompt from './prompts/next-action-guide.md?raw';
import { buildAskSubAgentTool } from './tools/ask-sub-agent/handler';
import { buildKillSubAgentTool } from './tools/kill-sub-agent/handler';
import { buildListSubAgentsTool } from './tools/list-sub-agents/handler';
import { buildReadSubAgentMessagesTool } from './tools/read-sub-agent-messages/handler';
import { buildRespondToChildAgentTool } from './tools/respond-to-child-agent/handler';
import { buildSendSubAgentMessageTool } from './tools/send-sub-agent-message/handler';
import { buildSpawnSubAgentTool } from './tools/spawn-sub-agent/handler';
import { childStatusLine, listSubAgentsCells } from './utils/sub-agent-cells';
import { readReferences } from './utils/sub-agent-references';
import { objectData, stringField } from './utils/sub-agent-signal-data';
import type {
  ChildLifecycle,
  ChildRecord,
  ParentSignalInput,
  PendingChildQuestion,
  SubAgentCapabilityConfig,
  SubAgentReference,
} from './utils/sub-agent-types';

/**
 * Capability installed on parent agents so they can manage child agents.
 * It owns spawn references, durable child messaging, and child ask tracking.
 */
export class SubAgentCapability extends AgentCapability<SubAgentCapabilityConfig> {
  public readonly id = 'sub-agent';
  public readonly description = 'Lets a Pebble agent spawn and message child agents.';
  private readonly childrenSlot = this.useState<ChildRecord[]>('children', []);
  private readonly pendingChildQuestionsSlot = this.useState<PendingChildQuestion[]>('pending-child-questions', []);

  /**
   * Injects a one-time orientation cell explaining the child lifecycle.
   */
  public override initialize(_config: SubAgentCapabilityConfig): void {
    this.agent.addUserContext('Sub-agent Lifecycle Primer', [
      Cell.header2('Sub-agent Lifecycle Primer'),
      Cell.text(lifecyclePrimerPrompt),
    ]);
  }

  /**
   * Adds child status context at the start of every parent turn.
   */
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

  /**
   * Registers child-agent tools for the parent agent.
   */
  public override hookOnRegister(config: SubAgentCapabilityConfig) {
    const references = readReferences(config);
    return {
      tools: [
        buildSpawnSubAgentTool(this, references),
        buildListSubAgentsTool(this, references),
        buildSendSubAgentMessageTool(this),
        buildAskSubAgentTool(this),
        buildReadSubAgentMessagesTool(this),
        buildRespondToChildAgentTool(this),
        buildKillSubAgentTool(this),
      ],
    };
  }

  public async spawnSubAgent(input: { referenceName: string; message: string }) {
    const runner = this.requireRunner();
    const childAgentId = await runner.spawn(input);
    const signalId = await this.registerSignal({
      description: `Wait for ${childAgentId} to answer.`,
      name: 'Sub-agent response',
    });
    this.childrenSlot.set([
      ...this.childrenSlot.value,
      {
        agentId: childAgentId,
        referenceName: input.referenceName,
        lifecycle: 'awaiting-reply',
        responseSignalId: signalId,
      },
    ]);
    await this.sendParentSignal({
      childAgentId,
      data: {
        message: input.message,
        parentAgentId: this.agent.agentId,
        parentCapabilityId: this.id,
        responseSignalId: signalId,
        type: 'respond-parent',
      },
      description: 'Parent agent asked this child for a startup response.',
      name: 'Parent ask',
    });
    this.traceSubAgentInvoke(childAgentId, input.referenceName, input.message);
    return ToolResponse.success([Cell.text(`Spawned ${childAgentId} and waiting for its response.`)]);
  }

  public listSubAgents(references: SubAgentReference[]) {
    return ToolResponse.success(listSubAgentsCells(references, this.childrenSlot.value));
  }

  public async sendSubAgentMessage(input: { childAgentId: string; message: string }) {
    const childAgentId = this.resolveChildAgentId(input.childAgentId);
    await this.sendParentSignal({
      childAgentId,
      data: { message: input.message, type: 'parent-message' },
      description: 'Parent agent sent a one-way message.',
      name: 'Parent message',
    });
    return ToolResponse.success([Cell.text(`Sent message to ${childAgentId}.`)]);
  }

  public async askSubAgent(input: { childAgentId: string; message: string }) {
    const childAgentId = this.resolveChildAgentId(input.childAgentId);
    const signalId = await this.registerSignal({
      description: `Wait for ${childAgentId} to answer.`,
      name: 'Sub-agent response',
    });
    this.childrenSlot.set(
      this.childrenSlot.value.map((child) =>
        child.agentId === childAgentId
          ? { ...child, lifecycle: 'awaiting-reply' as ChildLifecycle, responseSignalId: signalId }
          : child,
      ),
    );
    await this.sendParentSignal({
      childAgentId,
      data: {
        message: input.message,
        parentAgentId: this.agent.agentId,
        parentCapabilityId: this.id,
        responseSignalId: signalId,
        type: 'respond-parent',
      },
      description: 'Parent agent asked this child for a response.',
      name: 'Parent ask',
    });
    const referenceName =
      this.childrenSlot.value.find((child) => child.agentId === childAgentId)?.referenceName ?? childAgentId;
    this.traceSubAgentInvoke(childAgentId, referenceName, input.message);
    return ToolResponse.success([Cell.text(`Asked ${childAgentId} and waiting for its response.`)]);
  }

  public readSubAgentMessages(input: { childAgentId: string }) {
    const childAgentId = this.resolveChildAgentId(input.childAgentId);
    return ToolResponse.success([
      Cell.text(
        `No queued messages for ${childAgentId}. Responses arrive automatically as 'Sub-agent Response' context cells in a later turn — do not poll. Check the 'Sub-agent Status' cell for the child's current state.`,
      ),
    ]);
  }

  public async respondToChildAgent(input: { childAgentId: string; message: string }) {
    const childAgentId = this.resolveChildAgentId(input.childAgentId);
    const pending = this.pendingChildQuestionsSlot.value.find((item) => item.childAgentId === childAgentId);
    if (pending === undefined) {
      return ToolResponse.error('No child question pending.', [Cell.text('No child question pending.')]);
    }
    const continuationSignalId = pending.continueAfterResponse
      ? await this.registerSignal({
          description: `Wait for ${childAgentId} to answer.`,
          name: 'Sub-agent response',
        })
      : undefined;
    await this.resolveSignal({
      agentId: childAgentId,
      capabilityId: 'parent-link',
      data: {
        message: input.message,
        parentAgentId: this.agent.agentId,
        parentCapabilityId: this.id,
        type: 'parent-response',
        ...(continuationSignalId === undefined ? {} : { responseSignalId: continuationSignalId }),
      },
      signalId: pending.responseSignalId,
    });
    this.pendingChildQuestionsSlot.set(
      this.pendingChildQuestionsSlot.value.filter((item) => item.responseSignalId !== pending.responseSignalId),
    );
    if (continuationSignalId !== undefined) {
      this.childrenSlot.set(
        this.childrenSlot.value.map((child) =>
          child.agentId === childAgentId
            ? { ...child, lifecycle: 'awaiting-reply' as ChildLifecycle, responseSignalId: continuationSignalId }
            : child,
        ),
      );
      return ToolResponse.success([Cell.text(`Sent response to ${childAgentId} and waiting for its follow-up.`)]);
    }
    this.childrenSlot.set(
      this.childrenSlot.value.map((child) =>
        child.agentId === childAgentId
          ? { agentId: child.agentId, referenceName: child.referenceName, lifecycle: 'idle-after-reply' }
          : child,
      ),
    );
    return ToolResponse.success([Cell.text(`Sent response to ${childAgentId}.`)]);
  }

  public async killSubAgent(input: { childAgentId: string; reason: string }) {
    const childAgentId = this.resolveChildAgentId(input.childAgentId);
    await this.requireRunner().kill({ childAgentId, reason: input.reason });
    this.childrenSlot.set(
      this.childrenSlot.value.map((child) =>
        child.agentId === childAgentId
          ? { agentId: child.agentId, referenceName: child.referenceName, lifecycle: 'killed' }
          : child,
      ),
    );
    return ToolResponse.success([Cell.text(`Stopped ${childAgentId}.`)]);
  }

  private traceSubAgentInvoke(childAgentId: string, referenceName: string, message: string): void {
    this.agent.emit('trace', {
      type: 'sub-agent-invoke',
      data: {
        agentInstanceId: childAgentId,
        agentTemplateId: referenceName,
        input: [Cell.text(message)],
      },
    });
  }

  /**
   * Handles child-originated durable signals.
   */
  public override hookOnSignal(signal: AgentSignal): void {
    const data = objectData(signal.data);
    const type = stringField(data, 'type');
    if (type === 'sub-agent-response') {
      const childAgentId = stringField(data, 'childAgentId');
      const message = stringField(data, 'message');
      if (childAgentId === undefined || message === undefined) {
        return;
      }
      this.agent.emit('trace', {
        type: 'sub-agent-success',
        data: {
          agentInstanceId: childAgentId,
          output: [Cell.text(message)],
        },
      });
      this.childrenSlot.set(
        this.childrenSlot.value.map((child) =>
          child.agentId === childAgentId
            ? { agentId: child.agentId, referenceName: child.referenceName, lifecycle: 'idle-after-reply' }
            : child,
        ),
      );
      this.agent.addUserContext('Sub-agent Response', [Cell.header2('Sub-agent Response'), Cell.text(message)]);
      return;
    }
    if (type === 'child-message') {
      const childAgentId = stringField(data, 'childAgentId');
      const message = stringField(data, 'message');
      if (childAgentId === undefined || message === undefined) {
        return;
      }
      this.agent.addUserContext('Sub-agent Message', [
        Cell.header2(`Sub-agent Message: ${childAgentId}`),
        Cell.text(message),
      ]);
      return;
    }
    if (type === 'ask-parent') {
      const childAgentId = stringField(data, 'childAgentId');
      const message = stringField(data, 'message');
      const responseSignalId = stringField(data, 'responseSignalId');
      if (childAgentId === undefined || message === undefined || responseSignalId === undefined) {
        return;
      }
      this.childrenSlot.set(
        this.childrenSlot.value.map((child) =>
          child.agentId === childAgentId
            ? { agentId: child.agentId, referenceName: child.referenceName, lifecycle: 'awaiting-our-response' }
            : child,
        ),
      );
      this.pendingChildQuestionsSlot.set([
        ...this.pendingChildQuestionsSlot.value,
        { childAgentId, continueAfterResponse: signal.kind === 'awaited', responseSignalId },
      ]);
      this.agent.addUserContext('Sub-agent Ask', [
        Cell.header2(`Sub-agent Ask: ${childAgentId}`),
        Cell.text(message),
        Cell.text(`Respond with respond-to-child-agent for ${childAgentId}.`),
      ]);
    }
  }

  /**
   * Blocks exit while child agents are waiting on parent answers.
   */
  public override hookOnAgentExit() {
    if (this.pendingChildQuestionsSlot.value.length > 0) {
      return { permitExit: false as const, reason: 'Respond to pending child agent questions before exiting.' };
    }
    return super.hookOnAgentExit();
  }

  private requireRunner(): SubAgentRunner {
    const runner = getAgentBridge(this.agent).subAgent;
    if (runner === undefined) {
      throw new Error('sub-agent bridge is not installed.');
    }
    return runner;
  }

  private resolveChildAgentId(input: string): string {
    const exact = this.childrenSlot.value.find((child) => child.agentId === input);
    if (exact !== undefined) {
      return exact.agentId;
    }
    const prefixed = input.includes(':') ? input : `agents:${input}`;
    const matched = this.childrenSlot.value.find((child) => child.agentId === prefixed);
    if (matched !== undefined) {
      return matched.agentId;
    }
    throw new Error(`Unknown child agent id: ${input}`);
  }

  private async sendParentSignal(input: ParentSignalInput): Promise<void> {
    await this.sendSignal({
      agentId: input.childAgentId,
      capabilityId: 'parent-link',
      data: input.data,
      description: input.description,
      name: input.name,
    });
  }
}
