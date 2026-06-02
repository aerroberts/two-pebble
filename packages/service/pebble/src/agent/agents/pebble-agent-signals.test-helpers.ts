import { expect } from 'bun:test';
import type { AgentBridge } from '../../bridge';
import { Cell } from '../../thread';
import { MemorySignalOperations } from './memory-signal-operations';
import { PebbleAgent } from './pebble-agent';
import type { WaitStatus } from './pebble-agent-signals.test-types';
import { SignalTestCapability } from './signal-test-capability';
import { SignalTestProvider } from './signal-test-provider';

export function buildSignalTestRuntime(): SignalTestRuntime {
  const provider = new SignalTestProvider();
  const signals = new MemorySignalOperations('agent-signal-test');
  const agent = new PebbleAgent({
    agentId: 'agent-signal-test',
    bridge: buildTestBridge(signals),
    description: 'Signal test agent',
    name: 'Signal Agent',
    provider,
    workspacePath: '',
  });
  const capability = new SignalTestCapability();
  agent.registerCapability(capability, {});
  return { agent, capability, provider, signals };
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
  expect(runtime.signals.openSignalIds()).toEqual(['signal-test']);
}

export async function resumeFromSignal(runtime: SignalTestRuntime): Promise<void> {
  runtime.signals.receive('signal-test', { message: 'resume' });
  runtime.agent.resumeFromSignal();
  await waitForStatus(runtime.agent, 'idle');
}

export function expectSignalRuntimeConsumed(runtime: SignalTestRuntime): void {
  expect(runtime.capability.receivedMessages).toEqual(['resume']);
  expect(runtime.signals.resolvedSignalIds()).toEqual(['signal-test']);
  expect(runtime.provider.invokeCount).toBe(2);
}

interface SignalTestRuntime {
  agent: PebbleAgent;
  capability: SignalTestCapability;
  provider: SignalTestProvider;
  signals: MemorySignalOperations;
}

export function buildTestBridge(signals: MemorySignalOperations): AgentBridge {
  return {
    agent: { setName: async () => undefined },
    documents: {
      applyTodoStatus: async () => undefined,
      create: async () => ({ id: '', name: '' }),
      list: async () => ({ items: [], total: 0 }),
      read: async () => ({ id: '', markdown: '', name: '' }),
      readTodos: async () => [],
      update: async () => ({ id: '', name: '' }),
    },
    github: {
      submitPr: async () => {
        throw new Error('not used');
      },
    },
    memories: {
      listFiles: async () => [],
      readFile: async () => '',
      writeFile: async () => undefined,
    },
    signals,
    subAgents: {
      kill: async () => undefined,
      send: async () => {
        throw new Error('not used');
      },
      spawn: async () => {
        throw new Error('not used');
      },
    },
    taskBoards: {
      addDependency: async () => undefined,
      createPool: async () => ({ id: '' }),
      createTask: async () => ({ id: '' }),
      deleteDependency: async () => undefined,
      deletePool: async () => undefined,
      deleteTask: async () => undefined,
      describe: async () => ({ boardId: '', boardName: '', dependencies: [], pools: [], tasks: [] }),
      listTaskDeliverableSubmissions: async () => [],
      listTaskDeliverables: async () => [],
      listTaskEvents: async () => [],
      renameTask: async () => undefined,
      setTaskStatus: async () => undefined,
      updateTaskDescription: async () => undefined,
    },
  };
}
