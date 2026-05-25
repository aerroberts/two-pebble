import type {
  CommandExecutionItem,
  FileChangeItem,
  ItemCompletedEvent,
  ItemStartedEvent,
  McpToolCallItem,
  ReasoningItem,
  ThreadEvent,
  ThreadItem,
  TodoListItem,
  TurnCompletedEvent,
  TurnFailedEvent,
  WebSearchItem,
} from '@openai/codex-sdk';
import type { UsageReport } from '../../../pricing';
import type { DataCells } from '../../../thread/cells';
import { Cell } from '../../../thread/cells';
import type { PebbleAgentTrace, TaskListUpdateTask } from '../../../traces';
import { diffTaskList, type RawTodo } from '../../task-list-diff';
import { normalizeCodexModelId, sdkUsageToPebbleUsage } from './utils/model-usage';

export type ConvertedCodexEvent =
  | { kind: 'agent-trace'; trace: PebbleAgentTrace }
  | { kind: 'usage'; usage: UsageReport }
  | { kind: 'thread-id'; threadId: string }
  | { kind: 'turn-failure'; error: string };

/**
 * Maps a single Codex SDK `ThreadEvent` to a list of Pebble events.
 * Pure: no IO, no async, no SDK process state. The caller threads any
 * cross-event state (e.g. tracking which items are still in progress).
 */
export interface ConvertThreadEventContext {
  modelId: string | undefined;
  previousTaskList: TaskListUpdateTask[];
}

export function convertThreadEvent(event: ThreadEvent, context: ConvertThreadEventContext): ConvertedCodexEvent[] {
  if (event.type === 'thread.started') {
    return [{ kind: 'thread-id', threadId: event.thread_id }];
  }
  if (event.type === 'turn.started') {
    return [];
  }
  if (event.type === 'item.started') {
    return convertItemStarted(event);
  }
  if (event.type === 'item.updated') {
    return [];
  }
  if (event.type === 'item.completed') {
    return convertItemCompleted(event, context);
  }
  if (event.type === 'turn.completed') {
    return convertTurnCompleted(event, context.modelId);
  }
  if (event.type === 'turn.failed') {
    return convertTurnFailed(event);
  }
  if (event.type === 'error') {
    return [
      { kind: 'turn-failure', error: event.message },
      {
        kind: 'agent-trace',
        trace: { type: 'agent-failure', data: { error: event.message, content: [Cell.text(event.message)] } },
      },
    ];
  }
  return [];
}

function convertItemStarted(event: ItemStartedEvent): ConvertedCodexEvent[] {
  const item = event.item;
  if (item.type === 'command_execution') {
    return [
      {
        kind: 'agent-trace',
        trace: {
          type: 'tool-call-start',
          data: { callId: item.id, toolId: 'shell', input: { command: item.command }, source: 'framework' },
        },
      },
    ];
  }
  if (item.type === 'mcp_tool_call') {
    return [
      {
        kind: 'agent-trace',
        trace: {
          type: 'tool-call-start',
          data: {
            callId: item.id,
            toolId: `mcp:${item.server}/${item.tool}`,
            input: (item.arguments ?? {}) as object,
            source: 'framework',
          },
        },
      },
    ];
  }
  if (item.type === 'web_search') {
    return [
      {
        kind: 'agent-trace',
        trace: {
          type: 'tool-call-start',
          data: { callId: item.id, toolId: 'web_search', input: { query: item.query }, source: 'framework' },
        },
      },
    ];
  }
  return [];
}

function convertItemCompleted(event: ItemCompletedEvent, context: ConvertThreadEventContext): ConvertedCodexEvent[] {
  const item = event.item;
  if (item.type === 'agent_message') {
    return [
      {
        kind: 'agent-trace',
        trace: { type: 'assistant-message', data: { content: [Cell.text(item.text)] } },
      },
    ];
  }
  if (item.type === 'reasoning') {
    return reasoningToTraces(item);
  }
  if (item.type === 'command_execution') {
    return commandExecutionToTraces(item);
  }
  if (item.type === 'file_change') {
    return fileChangeToTraces(item);
  }
  if (item.type === 'mcp_tool_call') {
    return mcpToolCallToTraces(item);
  }
  if (item.type === 'web_search') {
    return webSearchToTraces(item);
  }
  if (item.type === 'todo_list') {
    return todoListToTraces(item, context);
  }
  if (item.type === 'error') {
    return [
      {
        kind: 'agent-trace',
        trace: { type: 'agent-failure', data: { error: item.message, content: [Cell.text(item.message)] } },
      },
    ];
  }
  return [];
}

function reasoningToTraces(item: ReasoningItem): ConvertedCodexEvent[] {
  if (item.text.trim().length === 0) {
    return [];
  }
  return [
    {
      kind: 'agent-trace',
      trace: { type: 'assistant-thinking', data: { content: [Cell.text(item.text)] } },
    },
  ];
}

function commandExecutionToTraces(item: CommandExecutionItem): ConvertedCodexEvent[] {
  const cells: DataCells = [Cell.text(item.aggregated_output)];
  if (item.status === 'failed') {
    return [
      {
        kind: 'agent-trace',
        trace: {
          type: 'tool-call-failure',
          data: {
            toolCallId: item.id,
            result: cells,
            error: `command exited with code ${item.exit_code ?? 'unknown'}`,
          },
        },
      },
    ];
  }
  return [
    {
      kind: 'agent-trace',
      trace: { type: 'tool-call-success', data: { toolCallId: item.id, result: cells } },
    },
  ];
}

function fileChangeToTraces(item: FileChangeItem): ConvertedCodexEvent[] {
  const summary = item.changes.map((change) => `${changeKindLabel(change.kind)} ${change.path}`).join('\n');
  const result: DataCells = summary.length > 0 ? [Cell.text(summary)] : [];
  if (item.status === 'failed') {
    return [
      {
        kind: 'agent-trace',
        trace: {
          type: 'tool-call-start',
          data: { callId: item.id, toolId: 'apply_patch', input: { changes: item.changes }, source: 'framework' },
        },
      },
      {
        kind: 'agent-trace',
        trace: {
          type: 'tool-call-failure',
          data: { toolCallId: item.id, result, error: 'patch application failed' },
        },
      },
    ];
  }
  return [
    {
      kind: 'agent-trace',
      trace: {
        type: 'tool-call-start',
        data: { callId: item.id, toolId: 'apply_patch', input: { changes: item.changes }, source: 'framework' },
      },
    },
    {
      kind: 'agent-trace',
      trace: { type: 'tool-call-success', data: { toolCallId: item.id, result } },
    },
  ];
}

type FileChangeKind = 'add' | 'delete' | 'update';

function changeKindLabel(kind: FileChangeKind): string {
  if (kind === 'add') {
    return 'add';
  }
  if (kind === 'delete') {
    return 'delete';
  }
  return 'update';
}

function mcpToolCallToTraces(item: McpToolCallItem): ConvertedCodexEvent[] {
  if (item.status === 'failed') {
    const message = item.error?.message ?? 'MCP tool call failed';
    return [
      {
        kind: 'agent-trace',
        trace: {
          type: 'tool-call-failure',
          data: { toolCallId: item.id, result: [Cell.text(message)], error: message },
        },
      },
    ];
  }
  const cells: DataCells = mcpResultCells(item);
  return [
    {
      kind: 'agent-trace',
      trace: { type: 'tool-call-success', data: { toolCallId: item.id, result: cells } },
    },
  ];
}

function mcpResultCells(item: McpToolCallItem): DataCells {
  const blocks = item.result?.content ?? [];
  const cells: DataCells = [];
  for (const block of blocks) {
    if (block.type === 'text' && typeof block.text === 'string') {
      cells.push(Cell.text(block.text));
    }
  }
  if (cells.length === 0 && item.result?.structured_content !== undefined) {
    cells.push(Cell.text(JSON.stringify(item.result.structured_content)));
  }
  return cells;
}

function webSearchToTraces(item: WebSearchItem): ConvertedCodexEvent[] {
  return [
    {
      kind: 'agent-trace',
      trace: { type: 'tool-call-success', data: { toolCallId: item.id, result: [Cell.text(item.query)] } },
    },
  ];
}

function todoListToTraces(item: TodoListItem, context: ConvertThreadEventContext): ConvertedCodexEvent[] {
  const todos: RawTodo[] = item.items.map((todo) => ({
    description: todo.text,
    status: todo.completed ? 'completed' : 'open',
  }));
  const { tasks, changes } = diffTaskList(context.previousTaskList, todos);
  context.previousTaskList = tasks;
  return [{ kind: 'agent-trace', trace: { type: 'task-list-update', data: { tasks, changes } } }];
}

function convertTurnCompleted(event: TurnCompletedEvent, modelId: string | undefined): ConvertedCodexEvent[] {
  const usage = sdkUsageToPebbleUsage(event.usage);
  return [
    {
      kind: 'usage',
      usage: { provider: 'openai', modelId: normalizeCodexModelId(modelId), usage },
    },
  ];
}

function convertTurnFailed(event: TurnFailedEvent): ConvertedCodexEvent[] {
  const message = event.error.message;
  return [
    { kind: 'turn-failure', error: message },
    {
      kind: 'agent-trace',
      trace: { type: 'agent-failure', data: { error: message, content: [Cell.text(message)] } },
    },
  ];
}

/** Re-exported so the agent layer can narrow the type when needed. */
export type { ThreadItem };
