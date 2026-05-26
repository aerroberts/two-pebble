import { describe, expect, test } from 'bun:test';
import { Agent } from './agent';
import { MemorySignalOperations } from './agents/memory-signal-operations';
import { buildTestBridge } from './agents/pebble-agent-signals.test-helpers';
import type { AgentInput, AgentStatusEvent } from './types';

class TestAgent extends Agent {
  public onStopReason: string | null = null;

  public exposeRunning(message: string): void {
    this.changeStatus('running', message);
  }

  protected override async onStop(reason: string): Promise<void> {
    this.onStopReason = reason;
  }
}

function buildAgent(): TestAgent {
  const signals = new MemorySignalOperations('agent-abort-test');
  const input: AgentInput = {
    agentId: 'agent-abort-test',
    bridge: buildTestBridge(signals),
    description: 'Abort test agent',
    name: 'Abort Agent',
    workspacePath: '',
  };
  return new TestAgent(input);
}

describe('feature: agent base abort controller', () => {
  test('happy: stop from running flips abort signal, calls onStop hook, transitions to idle', async () => {
    const agent = buildAgent();
    const events: AgentStatusEvent[] = [];
    agent.on('status', (event) => events.push(event));
    agent.exposeRunning('test running');

    expect(agent.abortSignal.aborted).toBe(false);

    await agent.stop('user request');

    expect(agent.abortSignal.aborted).toBe(true);
    expect(agent.onStopReason).toBe('user request');
    expect(events).toEqual([
      { status: 'running', message: 'test running' },
      { status: 'idle', message: 'stopped: user request' },
    ]);
  });

  test('happy: stop is idempotent — repeated calls do not abort twice or re-run onStop', async () => {
    const agent = buildAgent();
    agent.exposeRunning('test running');

    await agent.stop('first');
    const firstReason = agent.onStopReason;
    await agent.stop('second');

    expect(agent.abortSignal.aborted).toBe(true);
    expect(agent.onStopReason).toBe(firstReason);
    expect(agent.onStopReason).toBe('first');
  });

  test('happy: stop from already-idle state aborts the signal but does not re-emit idle status', async () => {
    const agent = buildAgent();
    const events: AgentStatusEvent[] = [];
    agent.on('status', (event) => events.push(event));

    await agent.stop('cleanup');

    expect(agent.abortSignal.aborted).toBe(true);
    expect(events).toEqual([]);
  });
});
