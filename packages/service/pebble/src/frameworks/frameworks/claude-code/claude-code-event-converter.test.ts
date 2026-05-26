import { describe, expect, it } from 'bun:test';
import { Cell } from '../../../thread/cells';
import { ClaudeCodeEventConverter } from './claude-code-event-converter';
import {
  assistantTextMessage,
  assistantTextMessageFor,
  assistantThinkingMessage,
  assistantTodoWriteMessage,
  assistantToolUseMessage,
  DEFAULT_TEST_MODEL_ID,
  expectTaskListStatuses,
  subagentStartHookInput,
  subagentStopHookInput,
  successResultMessage,
  successTranscript,
} from './claude-code-event-converter.test-env';

describe('feature: claude code event converter — assistant messages', () => {
  it('happy: assistant text becomes an agent-trace assistant-message event', () => {
    const events = new ClaudeCodeEventConverter().convertMessage(assistantTextMessage('hello'), 'anthropic');
    expect(events).toEqual([
      { kind: 'agent-trace', trace: { type: 'assistant-message', data: { content: [Cell.text('hello')] } } },
    ]);
  });

  it('happy: empty thinking blocks are skipped', () => {
    const events = new ClaudeCodeEventConverter().convertMessage(assistantThinkingMessage('   '), 'anthropic');
    expect(events).toEqual([]);
  });

  it('happy: tool_use becomes a tool-call-start trace tagged framework-source', () => {
    const events = new ClaudeCodeEventConverter().convertMessage(
      assistantToolUseMessage('call-1', 'Read'),
      'anthropic',
    );
    expect(events[0]).toMatchObject({
      kind: 'agent-trace',
      trace: { type: 'tool-call-start', data: { callId: 'call-1', toolId: 'Read', source: 'framework' } },
    });
  });
});

describe('feature: claude code event converter — TodoWrite tool', () => {
  it('happy: TodoWrite emits both tool-call-start and task-list-update', () => {
    const events = new ClaudeCodeEventConverter().convertMessage(assistantTodoWriteMessage('call-1'), 'anthropic');
    const types = events.map((event) => (event.kind === 'agent-trace' ? event.trace.type : event.kind));
    expect(types).toEqual(['tool-call-start', 'task-list-update']);
  });

  it('happy: in_progress maps to open status in the synthesized task list', () => {
    const events = new ClaudeCodeEventConverter().convertMessage(assistantTodoWriteMessage('call-1'), 'anthropic');
    expectTaskListStatuses(events);
  });
});

describe('feature: claude code event converter — sub-agent attribution', () => {
  it('happy: assistant message with explicit agent_id routes to a sub-agent trace', () => {
    const events = new ClaudeCodeEventConverter().convertMessage(
      assistantTextMessageFor('child-1', 'researcher', 'hi'),
      'anthropic',
    );
    expect(events[0]).toMatchObject({
      kind: 'sub-agent-trace',
      event: { agentInstanceId: 'child-1', agentTemplateId: 'researcher' },
    });
  });

  it('happy: forwarded message without agent_id falls back to most recent SubagentStart id', () => {
    const converter = new ClaudeCodeEventConverter();
    converter.convertSubagentStart(subagentStartHookInput('child-7', 'researcher'));
    const events = converter.convertMessage(assistantTextMessage('inherited'), 'anthropic');
    expect(events[0]).toMatchObject({ kind: 'sub-agent-trace', event: { agentInstanceId: 'child-7' } });
  });
});

describe('feature: claude code event converter — result messages', () => {
  it('happy: success result emits usage events plus an agent-success trace', () => {
    const events = new ClaudeCodeEventConverter().convertMessage(
      successResultMessage('done', DEFAULT_TEST_MODEL_ID),
      'anthropic',
    );
    expect(events).toMatchObject([
      { kind: 'usage', usage: { provider: 'anthropic', modelId: 'claude-opus-4-7' } },
      { kind: 'agent-trace', trace: { type: 'agent-success' } },
    ]);
  });

  it('happy: model id is normalized for ANSI-styled and provider-prefixed shapes', () => {
    const styled = `anthropic/claude-opus-4-7${String.fromCharCode(27)}[1m`;
    const events = new ClaudeCodeEventConverter().convertMessage(successResultMessage('done', styled), 'anthropic');
    expect(events[0]).toMatchObject({ kind: 'usage', usage: { modelId: 'claude-opus-4-7' } });
  });
});

describe('feature: claude code event converter — sub-agent transcripts', () => {
  it('happy: SubagentStop emits stop + per-model usage without durable sub-agent traces', () => {
    const stop = subagentStopHookInput('child-1', 'researcher', '/tmp/x.jsonl');
    const events = new ClaudeCodeEventConverter().convertSubagentStop(stop, successTranscript, 'anthropic');
    const kinds = events.map((event) => event.kind);
    expect(kinds).toEqual(['sub-agent-stop', 'usage', 'sub-agent-usage']);
    expect(events.some((event) => event.kind === 'agent-trace' && event.trace.type === 'sub-agent-invoke')).toBe(false);
  });

  it('unhappy: same transcript path is processed only once', () => {
    const converter = new ClaudeCodeEventConverter();
    const stop = subagentStopHookInput('child-1', 'researcher', '/tmp/dupe.jsonl');
    converter.convertSubagentStop(stop, successTranscript, 'anthropic');
    expect(converter.convertSubagentStop(stop, successTranscript, 'anthropic')).toEqual([]);
  });

  it('unhappy: missing transcript still cleans up active state and returns no events', () => {
    const converter = new ClaudeCodeEventConverter();
    converter.convertSubagentStart(subagentStartHookInput('child-9', 'researcher'));
    const stop = subagentStopHookInput('child-9', 'researcher', '/tmp/missing.jsonl');
    expect(converter.convertSubagentStop(stop, undefined, 'anthropic')).toEqual([]);
  });
});
