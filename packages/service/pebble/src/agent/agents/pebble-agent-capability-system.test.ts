import { describe, expect, test } from 'bun:test';
import type { PebbleAgentConversationCell } from '../types';
import { MemorySignalOperations } from './memory-signal-operations';
import { PebbleAgent } from './pebble-agent';
import { buildTestBridge } from './pebble-agent-signals.test-helpers';
import { SignalTestCapability } from './signal-test-capability';
import { SignalTestProvider } from './signal-test-provider';

describe('feature: pebble agent capability system prompts', () => {
  test('happy: fresh capability registration appends the capability system prompt', () => {
    const agent = buildAgent();
    const observed: PebbleAgentConversationCell[] = [];
    agent.on('threadMessage', (cell) => observed.push(cell));

    agent.registerCapability(new SignalTestCapability(), {});

    const systemCell = observed.find((cell) => cell.label === 'Capability System Prompt: signal-test');
    expect(systemCell?.role).toBe('system');
    expect(systemCell?.cells).toEqual([
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
          role: 'system',
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

function buildAgent(restoredThread?: ConstructorParameters<typeof PebbleAgent>[0]['restoredThread']): PebbleAgent {
  return new PebbleAgent({
    agentId: 'agent-system-prompt-test',
    bridge: buildTestBridge(new MemorySignalOperations('agent-system-prompt-test')),
    description: 'Capability system prompt test agent',
    name: 'System Prompt Agent',
    provider: new SignalTestProvider(),
    ...(restoredThread === undefined ? {} : { restoredThread }),
    workspacePath: '',
  });
}
