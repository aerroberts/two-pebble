import { expect } from 'bun:test';
import { installCapabilityRunners } from '../../capabilities';
import { Cell } from '../../thread';
import { MemorySignalRunner } from './memory-signal-runner';
import { PebbleAgent } from './pebble-agent';
import type { WaitStatus } from './pebble-agent-signals.test-types';
import { SignalTestCapability } from './signal-test-capability';
import { SignalTestProvider } from './signal-test-provider';

export function buildSignalTestRuntime(): SignalTestRuntime {
  const provider = new SignalTestProvider();
  const agent = new PebbleAgent({
    agentId: 'agent-signal-test',
    description: 'Signal test agent',
    name: 'Signal Agent',
    provider,
    workspacePath: '',
  });
  const runner = new MemorySignalRunner(agent.agentId);
  const capability = new SignalTestCapability();
  installCapabilityRunners(agent, { signal: runner });
  agent.registerCapability(capability, {});
  return { agent, capability, provider, runner };
}

export async function waitForStatus(agent: PebbleAgent, status: WaitStatus): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${status}`)), 1000);
    agent.on('status', (event) => {
      if (event.status === status) {
        clearTimeout(timeout);
        resolve();
      }
    });
  });
}

export async function waitOnSignal(runtime: SignalTestRuntime): Promise<void> {
  runtime.agent.sendMessage([Cell.text('wait')]);
  await waitForStatus(runtime.agent, 'waiting');
  expect(runtime.runner.openSignalIds()).toEqual(['signal-test']);
}

export async function resumeFromSignal(runtime: SignalTestRuntime): Promise<void> {
  runtime.runner.receive('signal-test', { message: 'resume' });
  runtime.agent.resumeFromSignal();
  await waitForStatus(runtime.agent, 'idle');
}

export function expectSignalRuntimeConsumed(runtime: SignalTestRuntime): void {
  expect(runtime.capability.receivedMessages).toEqual(['resume']);
  expect(runtime.runner.resolvedSignalIds()).toEqual(['signal-test']);
  expect(runtime.provider.invokeCount).toBe(2);
}

interface SignalTestRuntime {
  agent: PebbleAgent;
  capability: SignalTestCapability;
  provider: SignalTestProvider;
  runner: MemorySignalRunner;
}
