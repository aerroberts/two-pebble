import { z } from 'zod/v4';
import type { AgentSignal, SubAgentRunner } from '../../agent';
import { NativeTool, ToolResponse } from '../../agent';
import { Cell } from '../../thread';
import { AgentCapability } from '../agent-capability';
import { getCapabilityRunners } from '../runners';
import { listSubAgentsCells } from './sub-agent-cells';
import { readReferences, spawnToolDescription } from './sub-agent-references';
import {
  askSubAgentSchema,
  childAgentSchema,
  killSubAgentSchema,
  listSubAgentsSchema,
  referenceNameSchema,
  sendSubAgentSchema,
} from './sub-agent-schemas';
import { objectData, stringField } from './sub-agent-signal-data';
import type {
  ChildRecord,
  ParentSignalInput,
  PendingChildQuestion,
  SubAgentCapabilityConfig,
  SubAgentReference,
} from './sub-agent-types';

/**
 * Capability installed on parent agents so they can manage child agents.
 *
 * It owns spawn references, durable child messaging, and child ask tracking.
 */
export class SubAgentCapability extends AgentCapability<SubAgentCapabilityConfig> {
  public readonly id = 'sub-agent';
  public readonly description = 'Lets a Pebble agent spawn and message child agents.';
  private readonly childrenSlot = this.useState<ChildRecord[]>('children', []);
  private readonly pendingChildQuestionsSlot = this.useState<PendingChildQuestion[]>('pending-child-questions', []);

  /**
   * Registers child-agent tools for the parent agent.
   *
   * Tool calls use the installed runner for lifecycle and signals for messages.
   */
  public override hookOnRegister(config: SubAgentCapabilityConfig) {
    const references = readReferences(config);
    return {
      tools: [
        this.spawnTool(references),
        this.listTool(references),
        this.sendTool(),
        this.askTool(),
        this.readTool(),
        this.respondTool(),
        this.killTool(),
      ],
    };
  }

  private spawnTool(references: SubAgentReference[]) {
    const spawnSchema = z.object({
      referenceName: referenceNameSchema(references),
      message: z.string(),
    });
    return new NativeTool({
      description: spawnToolDescription(references),
      name: 'spawn-sub-agent',
      schema: spawnSchema,
    }).onInvoke(async (input) => {
      const runner = this.requireRunner();
      const childAgentId = await runner.spawn(input);
      this.childrenSlot.set([...this.childrenSlot.value, { agentId: childAgentId, referenceName: input.referenceName }]);
      await this.sendParentSignal({
        childAgentId,
        data: { message: input.message, type: 'parent-message' },
        description: 'Parent agent sent a startup message.',
        name: 'Parent message',
      });
      this.traceSubAgentInvoke(childAgentId, input.referenceName, input.message);
      return ToolResponse.success([Cell.text(`Spawned ${childAgentId}.`)]);
    });
  }

  private listTool(references: SubAgentReference[]) {
    return new NativeTool({
      description: 'List configured sub-agent reference names and spawned child agent ids.',
      name: 'list-sub-agents',
      schema: listSubAgentsSchema,
    }).onInvoke(() => ToolResponse.success(listSubAgentsCells(references, this.childrenSlot.value)));
  }

  private sendTool() {
    return new NativeTool({
      description: 'Send a one-way message to a child agent.',
      name: 'send-sub-agent-message',
      schema: sendSubAgentSchema,
    }).onInvoke(async (input) => {
      await this.sendParentSignal({
        childAgentId: input.childAgentId,
        data: { message: input.message, type: 'parent-message' },
        description: 'Parent agent sent a one-way message.',
        name: 'Parent message',
      });
      return ToolResponse.success([Cell.text(`Sent message to ${input.childAgentId}.`)]);
    });
  }

  private askTool() {
    return new NativeTool({
      description: 'Ask a child agent a question and wait for its reply.',
      name: 'ask-sub-agent',
      schema: askSubAgentSchema,
    }).onInvoke(async (input) => {
      const signalId = await this.registerSignal({
        description: `Wait for ${input.childAgentId} to answer.`,
        name: 'Sub-agent response',
      });
      this.childrenSlot.set(
        this.childrenSlot.value.map((child) =>
          child.agentId === input.childAgentId ? { ...child, responseSignalId: signalId } : child,
        ),
      );
      await this.sendParentSignal({
        childAgentId: input.childAgentId,
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
        this.childrenSlot.value.find((child) => child.agentId === input.childAgentId)?.referenceName ??
        input.childAgentId;
      this.traceSubAgentInvoke(input.childAgentId, referenceName, input.message);
      return ToolResponse.success([Cell.text(`Asked ${input.childAgentId} and waiting for its response.`)]);
    });
  }

  private readTool() {
    return new NativeTool({
      description: 'Read queued child messages without waiting.',
      name: 'read-sub-agent-messages',
      schema: childAgentSchema,
    }).onInvoke(() => ToolResponse.success([Cell.text('No queued child messages. Signal responses resume the agent.')]));
  }

  private respondTool() {
    return new NativeTool({
      description: 'Respond to a child agent that asked this parent a question.',
      name: 'respond-to-child-agent',
      schema: sendSubAgentSchema,
    }).onInvoke(async (input) => {
      const pending = this.pendingChildQuestionsSlot.value.find((item) => item.childAgentId === input.childAgentId);
      if (pending === undefined)
        return ToolResponse.error('No child question pending.', [Cell.text('No child question pending.')]);
      await this.resolveSignal({
        agentId: input.childAgentId,
        capabilityId: 'parent-link',
        data: {
          message: input.message,
          parentAgentId: this.agent.agentId,
          type: 'parent-response',
        },
        signalId: pending.responseSignalId,
      });
      this.pendingChildQuestionsSlot.set(
        this.pendingChildQuestionsSlot.value.filter((item) => item.responseSignalId !== pending.responseSignalId),
      );
      return ToolResponse.success([Cell.text(`Sent response to ${input.childAgentId}.`)]);
    });
  }

  private killTool() {
    return new NativeTool({
      description: 'Stop a child agent.',
      name: 'kill-sub-agent',
      schema: killSubAgentSchema,
    }).onInvoke(async (input) => {
      await this.requireRunner().kill(input);
      return ToolResponse.success([Cell.text(`Stopped ${input.childAgentId}.`)]);
    });
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
   *
   * Responses become trace output; child asks block parent exit until answered.
   */
  public override hookOnSignal(signal: AgentSignal): void {
    const data = objectData(signal.data);
    const type = stringField(data, 'type');
    if (type === 'sub-agent-response') {
      const childAgentId = stringField(data, 'childAgentId');
      const message = stringField(data, 'message');
      if (childAgentId === undefined || message === undefined) return;
      this.agent.emit('trace', {
        type: 'sub-agent-success',
        data: {
          agentInstanceId: childAgentId,
          output: [Cell.text(message)],
        },
      });
      this.agent.addUserContext('Sub-agent Response', [Cell.header2('Sub-agent Response'), Cell.text(message)]);
      return;
    }
    if (type === 'child-message') {
      const childAgentId = stringField(data, 'childAgentId');
      const message = stringField(data, 'message');
      if (childAgentId === undefined || message === undefined) return;
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
      if (childAgentId === undefined || message === undefined || responseSignalId === undefined) return;
      this.pendingChildQuestionsSlot.set([...this.pendingChildQuestionsSlot.value, { childAgentId, responseSignalId }]);
      this.agent.addUserContext('Sub-agent Ask', [
        Cell.header2(`Sub-agent Ask: ${childAgentId}`),
        Cell.text(message),
        Cell.text(`Respond with respond-to-child-agent for ${childAgentId}.`),
      ]);
    }
  }

  /**
   * Blocks exit while child agents are waiting on parent answers.
   *
   * This preserves the awaited signal contract between parent and child.
   */
  public override hookOnAgentExit() {
    if (this.pendingChildQuestionsSlot.value.length > 0) {
      return { permitExit: false as const, reason: 'Respond to pending child agent questions before exiting.' };
    }
    return super.hookOnAgentExit();
  }

  private requireRunner(): SubAgentRunner {
    const runner = getCapabilityRunners(this.agent).subAgent;
    if (runner === undefined) throw new Error('sub-agent runner is not installed.');
    return runner;
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
