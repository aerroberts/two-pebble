import { describe, expect, test } from 'bun:test';
import type { PebbleAgentConversationCell } from '../types';
import { MemorySignalOperations } from './memory-signal-operations';
import { PebbleAgent } from './pebble-agent';
import { buildTestBridge } from './pebble-agent-signals.test-helpers';
import { SignalTestCapability } from './signal-test-capability';
import { SignalTestProvider } from './signal-test-provider';

describe('feature: pebble agent capability system prompts', () => {
  test('happy: registry system prompt initializes after listeners attach', () => {
    const agent = buildAgent(undefined, 'Registry system instructions.');
    const observed: PebbleAgentConversationCell[] = [];
    agent.on('threadMessage', (cell) => observed.push(cell));

    agent.initializeSystemPrompt();

    const pebbleCell = observed.find((cell) => cell.label === 'Pebble System Prompt');
    expect(pebbleCell?.role).toBe('system');
    const systemCell = observed.find((cell) => cell.label === 'Agent System Prompt');
    expect(systemCell?.role).toBe('system');
    expect(systemCell?.cells).toEqual([
      {
        content: { text: 'Agent System Prompt' },
        type: 'header1',
      },
      {
        content: { text: 'Registry system instructions.' },
        type: 'text',
      },
    ]);
  });

  test('happy: rehydrated registry system prompt is not duplicated', () => {
    const agent = buildAgent({
      cells: [
        {
          cells: [{ content: { text: 'already registered' }, type: 'text' }],
          label: 'Agent System Prompt',
          orderId: 1,
          role: 'system',
        },
      ],
      threadId: 'thread-restored-system',
    });
    const observed: PebbleAgentConversationCell[] = [];
    agent.on('threadMessage', (cell) => observed.push(cell));

    agent.initializeSystemPrompt();

    expect(observed.some((cell) => cell.label === 'Pebble System Prompt')).toBe(false);
    expect(observed.some((cell) => cell.label === 'Agent System Prompt')).toBe(false);
  });

  test('happy: fresh capability registration appends the capability system prompt', () => {
    const agent = buildAgent();
    const observed: PebbleAgentConversationCell[] = [];
    agent.on('threadMessage', (cell) => observed.push(cell));

    agent.registerCapability(new SignalTestCapability(), {});

    const promptCell = observed.find((cell) => cell.label === 'Capability System Prompt: signal-test');
    expect(promptCell?.role).toBe('user');
    expect(promptCell?.cells).toEqual([
      {
        content: { text: 'Capability: signal-test' },
        type: 'header2',
      },
      {
        content: { text: 'Signal test capability system prompt.' },
        type: 'text',
      },
    ]);
  });

  test('happy: rehydrated capability registration rebuilds tools without duplicating the system prompt', () => {
    const agent = buildAgent({
      cells: [
        {
          cells: [{ content: { text: 'already registered' }, type: 'text' }],
          label: 'Capability System Prompt: signal-test',
          orderId: 1,
          role: 'user',
        },
      ],
      threadId: 'thread-restored',
    });
    const observed: PebbleAgentConversationCell[] = [];
    agent.on('threadMessage', (cell) => observed.push(cell));

    agent.hydrateCapability(new SignalTestCapability(), {}, new Map());

    expect(observed.some((cell) => cell.label === 'Capability System Prompt: signal-test')).toBe(false);
    expect(observed.some((cell) => cell.label === 'Tool Registration: wait-for-signal')).toBe(true);
  });
});

function buildAgent(
  restoredThread?: ConstructorParameters<typeof PebbleAgent>[0]['restoredThread'],
  systemPrompt?: string,
): PebbleAgent {
  return new PebbleAgent({
    agentId: 'agent-system-prompt-test',
    bridge: buildTestBridge(new MemorySignalOperations('agent-system-prompt-test')),
    description: 'Capability system prompt test agent',
    name: 'System Prompt Agent',
    provider: new SignalTestProvider(),
    ...(restoredThread === undefined ? {} : { restoredThread }),
    ...(systemPrompt === undefined ? {} : { systemPrompt }),
    workspacePath: '',
  });
}
