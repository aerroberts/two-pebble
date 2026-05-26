import type {
  SDKAssistantMessage,
  SDKMessage,
  SDKUserMessage,
  SubagentStartHookInput,
  SubagentStopHookInput,
} from '@anthropic-ai/claude-agent-sdk';
import type { UsageReport } from '../../../pricing';
import type { TaskListUpdateTask } from '../../../traces';
import {
  assistantMessageToTraces,
  type ConvertedClaudeCodeEvent,
  convertResultMessage,
  type ForwardedMetadata,
  parseTranscript,
  parseTranscriptUsages,
  type SubagentMetadata,
  taskSystemMessageToTaskListTrace,
  userMessageToTraces,
  wrapTraces,
} from './claude-code-trace-mapping';
import { normalizeClaudeCodeModelId, sdkUsageToPebbleUsage } from './utils/model-usage';

/**
 * Converts SDK signals (messages, sub-agent hooks, transcripts) into the
 * Pebble events the framework adapter publishes. Owns the in-flight
 * sub-agent attribution state so a forwarded SDK message routes to the
 * right child agent. Pure: no IO, no async, no SDK process — every method
 * is synchronous and the converter can be unit tested in isolation.
 */
export class ClaudeCodeEventConverter {
  private readonly activeSubagentIds: string[] = [];
  private readonly subagentTemplateIds = new Map<string, string>();
  private readonly processedSubagentTranscriptPaths = new Set<string>();
  private readonly hiddenTaskIds = new Set<string>();
  // Tracks the framework task snapshot, including progress/description
  // messages that do not deserve their own visible trace. Later lifecycle
  // changes and TodoWrite calls still diff against this state.
  private previousTaskList: TaskListUpdateTask[] = [];

  /**
   * Translates a single SDK message into Pebble events.
   * The provider is supplied by the caller because resolving it is an
   * async concern owned by the agent (account info), not the converter.
   */
  public convertMessage(message: SDKMessage, provider: string): ConvertedClaudeCodeEvent[] {
    if (message.type === 'assistant') {
      return this.convertAssistantMessage(message);
    }
    if (message.type === 'user') {
      return this.convertUserMessage(message);
    }
    if (message.type === 'result') {
      return convertResultMessage(message, provider);
    }
    if (message.type === 'system') {
      return this.convertSystemMessage(message);
    }
    return [];
  }

  /**
   * Records a SubagentStart hook so subsequent forwarded messages can be
   * attributed to this child agent and returns the lifecycle start event.
   */
  public convertSubagentStart(input: SubagentStartHookInput): ConvertedClaudeCodeEvent[] {
    this.activeSubagentIds.push(input.agent_id);
    this.subagentTemplateIds.set(input.agent_id, input.agent_type);
    return [{ kind: 'sub-agent-start', event: { agentInstanceId: input.agent_id, agentTemplateId: input.agent_type } }];
  }

  /**
   * Translates a SubagentStop hook plus its read transcript into Pebble
   * events. Pass `undefined` for the transcript when reading the file
   * failed; the converter still cleans up active state and returns no
   * events. Duplicate calls for the same transcript path are ignored.
   */
  public convertSubagentStop(
    input: SubagentStopHookInput,
    transcript: string | undefined,
    provider: string,
  ): ConvertedClaudeCodeEvent[] {
    if (this.processedSubagentTranscriptPaths.has(input.agent_transcript_path)) {
      return [];
    }
    this.processedSubagentTranscriptPaths.add(input.agent_transcript_path);
    if (transcript === undefined) {
      this.removeActiveSubagent(input.agent_id);
      return [];
    }
    const parsed = parseTranscript(transcript);
    const events: ConvertedClaudeCodeEvent[] = [
      {
        kind: 'sub-agent-stop',
        event: {
          agentInstanceId: input.agent_id,
          agentTemplateId: input.agent_type,
          status: parsed.status === 'failure' ? 'error' : 'success',
        },
      },
    ];
    this.removeActiveSubagent(input.agent_id);
    for (const { modelId, modelUsage } of parseTranscriptUsages(transcript)) {
      const usage: UsageReport = {
        provider,
        modelId: normalizeClaudeCodeModelId(modelId),
        usage: sdkUsageToPebbleUsage(modelUsage),
      };
      events.push({ kind: 'usage', usage });
      events.push({
        kind: 'sub-agent-usage',
        event: { agentInstanceId: input.agent_id, agentTemplateId: input.agent_type, usage },
      });
    }
    return events;
  }

  private convertAssistantMessage(message: SDKAssistantMessage): ConvertedClaudeCodeEvent[] {
    const { traces, taskList } = assistantMessageToTraces(message, this.previousTaskList);
    if (taskList !== null) {
      this.previousTaskList = taskList;
    }
    return wrapTraces(traces, this.readSubagentMetadata(message));
  }

  private convertSystemMessage(message: SDKMessage): ConvertedClaudeCodeEvent[] {
    const taskId = readTaskMessageId(message);
    if (taskId !== undefined && shouldHideTaskMessage(message, this.hiddenTaskIds)) {
      this.hiddenTaskIds.add(taskId);
      if (isTerminalTaskMessage(message)) {
        this.hiddenTaskIds.delete(taskId);
      }
      return [];
    }
    const update = taskSystemMessageToTaskListTrace(message, this.previousTaskList);
    if (update === undefined) {
      return [];
    }
    this.previousTaskList = update.tasks;
    if (update.trace === undefined) {
      return [];
    }
    return [{ kind: 'agent-trace', trace: update.trace }];
  }

  private convertUserMessage(message: SDKUserMessage): ConvertedClaudeCodeEvent[] {
    return wrapTraces(userMessageToTraces(message), this.readSubagentMetadata(message));
  }

  private readSubagentMetadata(message: SDKAssistantMessage | SDKUserMessage): SubagentMetadata | undefined {
    const metadata = message as (SDKAssistantMessage | SDKUserMessage) & ForwardedMetadata;
    const agentInstanceId = metadata.agent_id ?? metadata.agentId ?? this.activeSubagentIds.at(-1);
    if (agentInstanceId === undefined) {
      return undefined;
    }
    const agentTemplateId =
      metadata.agent_type ?? metadata.attributionAgent ?? this.subagentTemplateIds.get(agentInstanceId);
    if (agentTemplateId !== undefined) {
      this.subagentTemplateIds.set(agentInstanceId, agentTemplateId);
    }
    return { agentInstanceId, ...(agentTemplateId === undefined ? {} : { agentTemplateId }) };
  }

  private removeActiveSubagent(agentInstanceId: string) {
    const index = this.activeSubagentIds.lastIndexOf(agentInstanceId);
    if (index >= 0) {
      this.activeSubagentIds.splice(index, 1);
    }
  }
}

function readTaskMessageId(message: SDKMessage): string | undefined {
  if (message.type !== 'system') {
    return undefined;
  }
  if (
    message.subtype === 'task_notification' ||
    message.subtype === 'task_progress' ||
    message.subtype === 'task_started' ||
    message.subtype === 'task_updated'
  ) {
    return message.task_id;
  }
  return undefined;
}

function shouldHideTaskMessage(message: SDKMessage, hiddenTaskIds: Set<string>): boolean {
  const taskId = readTaskMessageId(message);
  if (taskId === undefined) {
    return false;
  }
  if (hiddenTaskIds.has(taskId)) {
    return true;
  }
  return message.type === 'system' && 'skip_transcript' in message && message.skip_transcript === true;
}

function isTerminalTaskMessage(message: SDKMessage): boolean {
  if (message.type !== 'system') {
    return false;
  }
  if (message.subtype === 'task_notification') {
    return true;
  }
  if (message.subtype !== 'task_updated') {
    return false;
  }
  return message.patch.status === 'completed' || message.patch.status === 'failed' || message.patch.status === 'killed';
}
