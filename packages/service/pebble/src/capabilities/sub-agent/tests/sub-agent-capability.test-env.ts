import { expect } from 'bun:test';
import { PebbleAgent } from '../../../agent/agents/pebble-agent';
import { SignalTestProvider } from '../../../agent/agents/signal-test-provider';
import type {
  AgentBridge,
  RegisterSignalInput,
  ResolveSignalInput,
  SendSignalInput,
  SignalOperations,
  SubAgentOperations,
  SubAgentSendInput,
  SubAgentSpawnInput,
} from '../../../bridge';
import { Cell } from '../../../thread';
import { SubAgentCapability } from '../capability';

export function expectSpawnRegistersNewToolSurface(): void {
  const registration = new SubAgentCapability().hookOnRegister({
    agents: [
      {
        agentRegistryId: 'agent-registries:research',
        description: 'Finds relevant implementation context.',
        name: 'researcher',
      },
    ],
  });
  expect(registration.tools.map((tool) => tool.id)).toEqual([
    'spawn-sub-agent',
    'send-agent',
    'wait-for-agents',
    'kill-sub-agent',
  ]);
  const spawnRegistration = registration.tools.find((tool) => tool.id === 'spawn-sub-agent')?.describe()[0];
  expect(spawnRegistration).toMatchObject({
    content: {
      inputSchema: {
        properties: {
          mode: { enum: ['task', 'teammate'] },
          subAgentId: { enum: ['researcher'] },
          workspace: { enum: ['inherit', 'worktree'] },
        },
      },
      name: 'spawn-sub-agent',
      toolType: 'native',
    },
    type: 'toolRegistration',
  });
}

export async function expectSpawnSendsTaskInstructions(): Promise<void> {
  const runtime = buildSubAgentCapabilityRuntime();
  const result = await runtime.tools
    .find((tool) => tool.id === 'spawn-sub-agent')
    ?.invoke({
      instructions: 'Find the answer.',
      mode: 'task',
      name: 'research-one',
      subAgentId: 'reviewer',
    });
  expect(runtime.spawned).toEqual([
    {
      instructions: subAgentInstructions({
        childName: 'research-one',
        instructions: 'Find the answer.',
        subAgentId: 'reviewer',
        workspace: 'inherit',
      }),
      mode: 'task',
      name: 'research-one',
      subAgentId: 'reviewer',
      workspace: 'inherit',
    },
  ]);
  expect(runtime.sentSignals).toEqual([]);
  expect(result).toMatchObject({
    content: [Cell.text('Spawned research-one (agents:child123).')],
    status: 'success',
  });
}

export async function expectSpawnUsesRequestedWorkspaceMode(): Promise<void> {
  const runtime = buildSubAgentCapabilityRuntime();
  await runtime.tools
    .find((tool) => tool.id === 'spawn-sub-agent')
    ?.invoke({
      instructions: 'Edit in isolation.',
      mode: 'task',
      name: 'isolated-one',
      subAgentId: 'reviewer',
      workspace: 'worktree',
    });
  expect(runtime.spawned).toEqual([
    {
      instructions: subAgentInstructions({
        childName: 'isolated-one',
        instructions: 'Edit in isolation.',
        subAgentId: 'reviewer',
        workspace: 'worktree',
      }),
      mode: 'task',
      name: 'isolated-one',
      subAgentId: 'reviewer',
      workspace: 'worktree',
    },
  ]);
}

export async function expectWaitRegistersFanInSignal(): Promise<void> {
  const runtime = buildSubAgentCapabilityRuntime();
  await runtime.tools
    .find((tool) => tool.id === 'spawn-sub-agent')
    ?.invoke({
      instructions: 'Find the answer.',
      mode: 'task',
      name: 'research-one',
      subAgentId: 'reviewer',
    });
  const result = await runtime.tools
    .find((tool) => tool.id === 'wait-for-agents')
    ?.invoke({
      names: ['research-one'],
    });
  expect(runtime.registeredSignals[0]).toMatchObject({
    capabilityId: 'sub-agent',
    description: 'Wait for sub-agent research-one (agents:child123) to respond.',
    name: 'Sub-agent result',
  });
  expect(result).toMatchObject({
    content: [Cell.text('Waiting for child agents: research-one.')],
    status: 'success',
  });
}

export async function expectTeammateFollowUpUsesChildSignal(): Promise<void> {
  const runtime = buildSubAgentCapabilityRuntime();
  await runtime.tools
    .find((tool) => tool.id === 'spawn-sub-agent')
    ?.invoke({
      instructions: 'Start.',
      mode: 'teammate',
      name: 'pair-one',
      subAgentId: 'reviewer',
    });
  runtime.capability.hookOnSignal({
    agentId: 'agents:parent123',
    capabilityId: 'sub-agent',
    data: {
      childAgentId: 'agents:child123',
      childName: 'pair-one',
      childResponseSignalId: 'child-wait-1',
      message: 'Initial result.',
      status: 'response',
      type: 'sub-agent-result',
    },
    description: 'Teammate responded.',
    id: 'agent-signals:teammate-response',
    kind: 'push',
    name: 'Sub-agent result',
    signalId: 'signal-teammate-response',
    status: 'received',
  });
  const result = await runtime.tools
    .find((tool) => tool.id === 'send-agent')
    ?.invoke({
      instructions: 'Follow up.',
      name: 'pair-one',
    });
  expect(runtime.resolvedSignals[0]).toMatchObject({
    agentId: 'agents:child123',
    capabilityId: 'parent-linked-teammate',
    data: {
      instructions: 'Follow up.',
      type: 'parent-instructions',
    },
    signalId: 'child-wait-1',
  });
  expect(result).toMatchObject({
    content: [Cell.text('Sent instructions to pair-one.')],
    status: 'success',
  });
}

export async function expectSendToFrameworkChildUsesSubAgentSend(): Promise<void> {
  const runtime = buildSubAgentCapabilityRuntime({ spawnRuntime: 'framework' });
  await runtime.tools
    .find((tool) => tool.id === 'spawn-sub-agent')
    ?.invoke({
      instructions: 'Start.',
      mode: 'teammate',
      name: 'pair-one',
      subAgentId: 'reviewer',
    });
  runtime.capability.hookOnSignal({
    agentId: 'agents:parent123',
    capabilityId: 'sub-agent',
    data: {
      childAgentId: 'agents:child123',
      childName: 'pair-one',
      message: 'Initial result.',
      status: 'response',
      type: 'sub-agent-result',
    },
    description: 'Framework child responded.',
    id: 'agent-signals:framework-response',
    kind: 'push',
    name: 'Sub-agent result',
    signalId: 'signal-framework-response',
    status: 'received',
  });
  const result = await runtime.tools
    .find((tool) => tool.id === 'send-agent')
    ?.invoke({
      instructions: 'Follow up.',
      name: 'pair-one',
    });
  expect(runtime.sentSubAgentMessages).toEqual([
    {
      childAgentId: 'agents:child123',
      childName: 'pair-one',
      instructions: 'Follow up.',
      mode: 'teammate',
    },
  ]);
  expect(runtime.resolvedSignals).toEqual([]);
  expect(result).toMatchObject({
    content: [Cell.text('Sent instructions to pair-one.')],
    status: 'success',
  });
}

export async function expectSendRejectsTerminalTask(): Promise<void> {
  const runtime = buildSubAgentCapabilityRuntime();
  await runtime.tools
    .find((tool) => tool.id === 'spawn-sub-agent')
    ?.invoke({
      instructions: 'Find the answer.',
      mode: 'task',
      name: 'research-one',
      subAgentId: 'reviewer',
    });
  runtime.capability.hookOnSignal({
    agentId: 'agents:parent123',
    capabilityId: 'sub-agent',
    data: {
      childAgentId: 'agents:child123',
      childName: 'research-one',
      message: 'Done.',
      status: 'success',
      type: 'sub-agent-result',
    },
    description: 'Task completed.',
    id: 'agent-signals:task-complete',
    kind: 'push',
    name: 'Sub-agent result',
    signalId: 'signal-task-complete',
    status: 'received',
  });
  const result = await runtime.tools
    .find((tool) => tool.id === 'send-agent')
    ?.invoke({
      instructions: 'More work.',
      name: 'research-one',
    });
  expect(result).toMatchObject({
    content: [Cell.text('Child agent research-one is terminal.')],
    status: 'error',
  });
}

function buildSubAgentCapabilityRuntime(config: { spawnRuntime?: 'framework' | 'pebble' } = {}) {
  const capability = new SubAgentCapability();
  const registeredSignals: RegisterSignalInput[] = [];
  const resolvedSignals: ResolveSignalInput[] = [];
  const sentSignals: SendSignalInput[] = [];
  const sentSubAgentMessages: SubAgentSendInput[] = [];
  const spawned: SubAgentSpawnInput[] = [];
  const signals: SignalOperations = {
    markResolved: async () => undefined,
    register: async (input) => {
      registeredSignals.push(input);
      return `signal-${registeredSignals.length}`;
    },
    resolve: async (input) => {
      resolvedSignals.push(input);
    },
    send: async (input) => {
      sentSignals.push(input);
    },
    snapshot: async () => ({ openAwaited: [], received: [] }),
  };
  const subAgents: SubAgentOperations = {
    kill: async () => undefined,
    send: async (message) => {
      sentSubAgentMessages.push(message);
    },
    spawn: async (input) => {
      spawned.push(input);
      return { agentId: 'agents:child123', runtime: config.spawnRuntime ?? 'pebble' };
    },
  };
  const agent = new PebbleAgent({
    agentId: 'agents:parent123',
    bridge: buildTestBridge({ signals, subAgents }),
    description: 'Parent agent',
    name: 'Parent',
    provider: new SignalTestProvider(),
    workspacePath: '/workspace/parent',
  });
  capability.attach(agent);
  const tools = capability.hookOnRegister({
    agents: [{ agentRegistryId: 'agent-registries:review', name: 'reviewer' }],
  }).tools;
  return { capability, registeredSignals, resolvedSignals, sentSignals, sentSubAgentMessages, spawned, tools };
}

function subAgentInstructions(input: {
  childName: string;
  instructions: string;
  subAgentId: string;
  workspace: 'inherit' | 'worktree';
}): string {
  const currentWorkspace =
    input.workspace === 'inherit'
      ? '/workspace/parent'
      : 'a fresh worktree created from the parent workspace; the runtime launches you inside it';
  return [
    'Sub-agent launch context:',
    `- You are child agent "${input.childName}" (${input.subAgentId}) spawned by parent "Parent" (agents:parent123).`,
    `- Workspace mode: ${input.workspace} from the parent workspace.`,
    '- Parent workspace: /workspace/parent.',
    `- Current workspace: ${currentWorkspace}.`,
    '',
    'Parent instructions:',
    input.instructions,
  ].join('\n');
}

function buildTestBridge(input: { signals: SignalOperations; subAgents: SubAgentOperations }): AgentBridge {
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
      submitPr: async () => ({
        deliverableId: 'deliverable:test',
        signalId: 'pr:test',
        taskId: 'task:test',
        trackedPrId: 'tracked-pr:test',
      }),
    },
    signals: input.signals,
    subAgents: input.subAgents,
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
      setOwnedTaskStatus: async () => undefined,
      setTaskStatus: async () => undefined,
      submitDeliverable: async () => {
        throw new Error('not used');
      },
      updateTaskDescription: async () => undefined,
    },
  };
}
