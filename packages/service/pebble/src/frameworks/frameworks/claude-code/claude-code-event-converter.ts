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
  invokeTrace,
  outcomeTrace,
  parseTranscript,
  parseTranscriptUsages,
  type SubagentMetadata,
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
  // Tracks the most recently emitted task-list snapshot so subsequent
  // TodoWrite calls can compute a real diff (oldStatus -> newStatus)
  // instead of always reporting changes against an empty baseline.
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
      { kind: 'agent-trace', trace: invokeTrace(input, parsed) },
      { kind: 'agent-trace', trace: outcomeTrace(input, parsed) },
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
