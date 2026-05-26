import type {
  ModelUsage as ClaudeCodeSdkModelUsage,
  SDKAssistantMessage,
  SDKMessage,
  SDKResultMessage,
  SDKTaskNotificationMessage,
  SDKTaskProgressMessage,
  SDKTaskStartedMessage,
  SDKTaskUpdatedMessage,
  SDKUserMessage,
  SubagentStopHookInput,
} from '@anthropic-ai/claude-agent-sdk';
import type { ToolResultBlockParam } from '@anthropic-ai/sdk/resources';
import type { UsageReport } from '../../../pricing';
import type { DataCells } from '../../../thread/cells';
import { Cell, text } from '../../../thread/cells';
import type { PebbleAgentTrace, TaskListUpdateStatus, TaskListUpdateTask } from '../../../traces';
import type { PebbleJsonRecord, PebbleJsonValue } from '../../../types';
import { diffTaskList, type RawTodo } from '../../task-list-diff';
import type { SubAgentLifecycleEvent, SubAgentTraceEvent, SubAgentUsageEvent } from '../../types';
import { cellToString } from './utils/cell-to-string';
import { normalizeClaudeCodeModelId, sdkUsageToPebbleUsage } from './utils/model-usage';

export type ToolResultContent = ToolResultBlockParam['content'];
type UserMessageBlocks = Exclude<SDKUserMessage['message']['content'], string>;
type UserMessageBlock = UserMessageBlocks[number];

export type ConvertedClaudeCodeEvent =
  | { kind: 'agent-trace'; trace: PebbleAgentTrace }
  | { kind: 'sub-agent-trace'; event: SubAgentTraceEvent }
  | { kind: 'sub-agent-start'; event: SubAgentLifecycleEvent }
  | { kind: 'sub-agent-stop'; event: SubAgentLifecycleEvent }
  | { kind: 'sub-agent-usage'; event: SubAgentUsageEvent }
  | { kind: 'usage'; usage: UsageReport };

export interface SubagentMetadata {
  agentInstanceId: string;
  agentTemplateId?: string;
}

export interface ForwardedMetadata {
  agent_id?: string;
  agentId?: string;
  agent_type?: string;
  attributionAgent?: string;
}

export interface ParsedTranscript {
  input: DataCells;
  output: DataCells;
  status: 'failure' | 'success';
  error?: string;
}

export interface ParsedTranscriptUsage {
  modelId: string;
  modelUsage: ClaudeCodeSdkModelUsage;
}

interface TranscriptMessage {
  errors?: string[];
  message?: { content?: string | { text?: string; type?: string }[] };
  modelUsage?: Record<string, ClaudeCodeSdkModelUsage>;
  result?: string;
  subtype?: string;
  type?: string;
}

export function wrapTraces(
  traces: PebbleAgentTrace[],
  subagent: SubagentMetadata | undefined,
): ConvertedClaudeCodeEvent[] {
  if (subagent === undefined) {
    return traces.map((trace) => ({ kind: 'agent-trace', trace }));
  }
  return traces.map((trace) => ({ kind: 'sub-agent-trace', event: { ...subagent, trace } }));
}

export function assistantMessageToTraces(
  message: SDKAssistantMessage,
  previousTaskList: TaskListUpdateTask[],
): { traces: PebbleAgentTrace[]; taskList: TaskListUpdateTask[] | null } {
  const traces: PebbleAgentTrace[] = [];
  let nextTaskList: TaskListUpdateTask[] | null = null;
  for (const block of message.message.content) {
    if (block.type === 'text') {
      traces.push({ type: 'assistant-message', data: { content: [Cell.text(block.text)] } });
    } else if (block.type === 'thinking' && block.thinking.trim().length > 0) {
      traces.push({ type: 'assistant-thinking', data: { content: [Cell.text(block.thinking)] } });
    } else if (block.type === 'tool_use') {
      traces.push({
        type: 'tool-call-start',
        data: { callId: block.id, toolId: block.name, input: (block.input ?? {}) as object, source: 'framework' },
      });
      const baseline = nextTaskList ?? previousTaskList;
      const update = todoWriteToTaskListTrace(block.name, block.input as PebbleJsonValue | undefined, baseline);
      if (update !== undefined) {
        traces.push(update.trace);
        nextTaskList = update.tasks;
      }
    }
  }
  return { traces, taskList: nextTaskList };
}

type TaskSystemMessage =
  | SDKTaskNotificationMessage
  | SDKTaskProgressMessage
  | SDKTaskStartedMessage
  | SDKTaskUpdatedMessage;

interface TodoLike {
  content?: PebbleJsonValue;
  id?: PebbleJsonValue;
  status?: PebbleJsonValue;
}

function todoWriteToTaskListTrace(
  toolName: string,
  rawInput: PebbleJsonValue | undefined,
  previousTaskList: TaskListUpdateTask[],
): { trace: PebbleAgentTrace; tasks: TaskListUpdateTask[] } | undefined {
  if (toolName !== 'TodoWrite') {
    return undefined;
  }
  if (rawInput === null || rawInput === undefined || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
    return undefined;
  }
  const todosRaw = (rawInput as PebbleJsonRecord).todos;
  if (!Array.isArray(todosRaw)) {
    return undefined;
  }
  const todos: RawTodo[] = [];
  for (const raw of todosRaw) {
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
      continue;
    }
    const todo = raw as TodoLike;
    if (typeof todo.content !== 'string') {
      continue;
    }
    const status = mapTodoStatus(todo.status);
    if (status === undefined) {
      continue;
    }
    todos.push({
      description: todo.content,
      ...(typeof todo.id === 'string' ? { id: todo.id } : {}),
      status,
    });
  }
  const { tasks, changes } = diffTaskList(previousTaskList, todos);
  return { trace: { type: 'task-list-update', data: { tasks, changes } }, tasks };
}

function mapTodoStatus(value: PebbleJsonValue | undefined): TaskListUpdateStatus | undefined {
  if (value === 'pending') {
    return 'pending';
  }
  if (value === 'in_progress') {
    return 'open';
  }
  if (value === 'completed') {
    return 'completed';
  }
  return undefined;
}

export function taskSystemMessageToTaskListTrace(
  message: SDKMessage,
  previousTaskList: TaskListUpdateTask[],
): { trace: PebbleAgentTrace; tasks: TaskListUpdateTask[] } | undefined {
  if (!isTaskSystemMessage(message)) {
    return undefined;
  }
  const todo = taskSystemMessageToRawTodo(message, previousTaskList);
  if (todo === undefined) {
    return undefined;
  }
  const todos = upsertRawTodo(previousTaskList, todo);
  const { tasks, changes } = diffTaskList(previousTaskList, todos);
  return { trace: { type: 'task-list-update', data: { tasks, changes } }, tasks };
}

function isTaskSystemMessage(message: SDKMessage): message is TaskSystemMessage {
  return (
    message.type === 'system' &&
    (message.subtype === 'task_notification' ||
      message.subtype === 'task_progress' ||
      message.subtype === 'task_started' ||
      message.subtype === 'task_updated')
  );
}

function taskSystemMessageToRawTodo(
  message: TaskSystemMessage,
  previousTaskList: TaskListUpdateTask[],
): RawTodo | undefined {
  const previous = previousTaskList.find((task) => task.id === message.task_id);
  if (message.subtype === 'task_started') {
    return { description: message.description, id: message.task_id, status: 'open' };
  }
  if (message.subtype === 'task_progress') {
    return { description: message.description, id: message.task_id, status: 'open' };
  }
  if (message.subtype === 'task_updated') {
    const status = mapTaskStatus(message.patch.status) ?? previous?.status;
    if (status === undefined) {
      return undefined;
    }
    return {
      description: message.patch.description ?? previous?.description ?? message.task_id,
      id: message.task_id,
      status,
    };
  }
  const status = mapTaskNotificationStatus(message.status);
  return {
    description: previous?.description ?? message.summary,
    id: message.task_id,
    status,
  };
}

function upsertRawTodo(previousTaskList: TaskListUpdateTask[], todo: RawTodo): RawTodo[] {
  const todos: RawTodo[] = previousTaskList.map((task) => ({
    description: task.description,
    id: task.id,
    status: task.status,
  }));
  const index = todos.findIndex((item) => item.id === todo.id);
  if (index === -1) {
    todos.push(todo);
  } else {
    todos[index] = todo;
  }
  return todos;
}

function mapTaskStatus(value: SDKTaskUpdatedMessage['patch']['status']): TaskListUpdateStatus | undefined {
  if (value === 'pending') {
    return 'pending';
  }
  if (value === 'running') {
    return 'open';
  }
  if (value === 'completed') {
    return 'completed';
  }
  if (value === 'failed' || value === 'killed') {
    return 'invalid';
  }
  return undefined;
}

function mapTaskNotificationStatus(value: SDKTaskNotificationMessage['status']): TaskListUpdateStatus {
  if (value === 'completed') {
    return 'completed';
  }
  return 'invalid';
}

export function userMessageToTraces(message: SDKUserMessage): PebbleAgentTrace[] {
  const content = message.message.content;
  if (typeof content === 'string') {
    return [{ type: 'user-message', data: { content: [text(content)] } }];
  }
  const traces: PebbleAgentTrace[] = [];
  for (const block of content) {
    const trace = userBlockToTrace(block);
    if (trace !== undefined) {
      traces.push(trace);
    }
  }
  return traces;
}

function userBlockToTrace(block: UserMessageBlock): PebbleAgentTrace | undefined {
  if (typeof block === 'string') {
    return { type: 'user-message', data: { content: [text(block)] } };
  }
  if (block.type === 'text') {
    return { type: 'user-message', data: { content: [text(block.text)] } };
  }
  if (block.type !== 'tool_result') {
    return undefined;
  }
  const resultCells = toolResultCells(block.content);
  if (block.is_error) {
    return {
      type: 'tool-call-failure',
      data: {
        toolCallId: block.tool_use_id,
        result: resultCells,
        error: resultCells.map((cell) => cellToString(cell)).join('\n'),
      },
    };
  }
  return {
    type: 'tool-call-success',
    data: { toolCallId: block.tool_use_id, result: resultCells },
  };
}

function toolResultCells(content: ToolResultContent): DataCells {
  if (content === undefined) {
    return [];
  }
  if (typeof content === 'string') {
    return [Cell.text(content)];
  }
  const cells: DataCells = [];
  for (const block of content) {
    if (block.type === 'text') {
      cells.push(Cell.text(block.text));
    }
  }
  return cells;
}

export function convertResultMessage(message: SDKResultMessage, provider: string): ConvertedClaudeCodeEvent[] {
  const events: ConvertedClaudeCodeEvent[] = [];
  for (const [modelId, modelUsage] of Object.entries(message.modelUsage)) {
    events.push({
      kind: 'usage',
      usage: { provider, modelId: normalizeClaudeCodeModelId(modelId), usage: sdkUsageToPebbleUsage(modelUsage) },
    });
  }
  if (message.subtype === 'success') {
    events.push({
      kind: 'agent-trace',
      trace: { type: 'agent-success', data: { content: [Cell.text(message.result)] } },
    });
  } else {
    events.push({
      kind: 'agent-trace',
      trace: {
        type: 'agent-failure',
        data: { error: message.subtype, content: [Cell.text(message.errors.join('\n'))] },
      },
    });
  }
  return events;
}

export function invokeTrace(input: SubagentStopHookInput, parsed: ParsedTranscript): PebbleAgentTrace {
  return {
    type: 'sub-agent-invoke',
    data: { agentInstanceId: input.agent_id, agentTemplateId: input.agent_type, input: parsed.input },
  };
}

export function outcomeTrace(input: SubagentStopHookInput, parsed: ParsedTranscript): PebbleAgentTrace {
  if (parsed.status === 'failure') {
    return {
      type: 'sub-agent-failure',
      data: { agentInstanceId: input.agent_id, error: parsed.error ?? 'Sub-agent failed.', output: parsed.output },
    };
  }
  return { type: 'sub-agent-success', data: { agentInstanceId: input.agent_id, output: parsed.output } };
}

export function parseTranscript(transcript: string): ParsedTranscript {
  const messages = parseTranscriptMessages(transcript);
  const inputText = readMessageText(messages.find((item) => item.type === 'user'));
  const outputText = readAssistantText(messages) || readResultText(messages);
  const error = readResultError(messages);
  return {
    ...(error === undefined ? {} : { error }),
    input: cellsFromText(inputText),
    output: cellsFromText(outputText),
    status: error === undefined ? 'success' : 'failure',
  };
}

export function parseTranscriptUsages(transcript: string): ParsedTranscriptUsage[] {
  const usages: ParsedTranscriptUsage[] = [];
  for (const message of parseTranscriptMessages(transcript)) {
    if (message.type !== 'result' || message.modelUsage === undefined) {
      continue;
    }
    for (const [modelId, modelUsage] of Object.entries(message.modelUsage)) {
      usages.push({ modelId, modelUsage });
    }
  }
  return usages;
}

function parseTranscriptMessages(transcript: string): TranscriptMessage[] {
  return transcript
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => parseTranscriptLine(line));
}

function parseTranscriptLine(line: string): TranscriptMessage {
  try {
    return JSON.parse(line) as TranscriptMessage;
  } catch {
    return {};
  }
}

function readAssistantText(messages: TranscriptMessage[]): string {
  return messages
    .filter((item) => item.type === 'assistant')
    .map((message) => readMessageText(message))
    .filter((value) => value.trim().length > 0)
    .join('\n\n');
}

function readResultText(messages: TranscriptMessage[]): string {
  const result = messages.find((item) => item.type === 'result' && typeof item.result === 'string');
  return result?.result ?? '';
}

function readResultError(messages: TranscriptMessage[]): string | undefined {
  const result = messages.find((item) => item.type === 'result' && item.subtype !== 'success');
  if (result === undefined) {
    return undefined;
  }
  return result.errors?.join('\n') ?? result.subtype ?? 'Sub-agent failed.';
}

function readMessageText(message: TranscriptMessage | undefined): string {
  if (message === undefined) {
    return '';
  }
  const content = message.message?.content;
  if (typeof content === 'string') {
    return content;
  }
  if (content === undefined) {
    return '';
  }
  return content
    .filter((block) => block.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text ?? '')
    .join('\n');
}

function cellsFromText(value: string): DataCells {
  return value.trim().length > 0 ? [Cell.text(value)] : [];
}
