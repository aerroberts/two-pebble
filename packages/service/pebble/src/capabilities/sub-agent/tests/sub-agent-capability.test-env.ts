import { expect } from 'bun:test';
import type {
  RegisterSignalInput,
  ResolveSignalInput,
  SendSignalInput,
  SignalRunner,
  SubAgentRunner,
  SubAgentSpawnInput,
} from '../../../agent';
import { PebbleAgent } from '../../../agent/agents/pebble-agent';
import { SignalTestProvider } from '../../../agent/agents/signal-test-provider';
import { installAgentBridge } from '../../../capabilities';
import { Cell } from '../../../thread';
import { SubAgentCapability } from '../capability';

export function subAgentToolsForResearcher() {
  return new SubAgentCapability().hookOnRegister({
    agents: [
      {
        agentRegistryId: 'agent-registries:research',
        description: 'Finds relevant implementation context.',
        name: 'researcher',
      },
    ],
  }).tools;
}

export function subAgentToolsForReviewer() {
  return new SubAgentCapability().hookOnRegister({
    agents: [
      {
        agentRegistryId: 'agent-registries:review',
        description: 'Reviews completed code changes.',
        name: 'reviewer',
      },
    ],
  }).tools;
}

export function expectResearcherSpawnRegistration(): void {
  const spawnTool = subAgentToolsForResearcher().find((tool) => tool.id === 'spawn-sub-agent');
  const registration = spawnTool?.describe()[0];
  expect(registration).toMatchObject({
    type: 'toolRegistration',
    content: {
      name: 'spawn-sub-agent',
      toolType: 'native',
    },
  });
  const description = (registration as { content: { description: string } } | undefined)?.content.description ?? '';
  expect(description).toContain('Valid reference names: researcher - Finds relevant implementation context.');
  expect(description).toContain('Framework children');
  expect(registration).toHaveProperty('content.inputSchema.properties.referenceName.enum', ['researcher']);
}

export async function expectReviewerListOutput(): Promise<void> {
  const listTool = subAgentToolsForReviewer().find((tool) => tool.id === 'list-sub-agents');
  const result = await listTool?.invoke({});
  expect(result).toMatchObject({
    status: 'success',
    content: [
      Cell.header2('Configured sub-agents'),
      Cell.text('reviewer - Reviews completed code changes.'),
      Cell.header2('Spawned child agents'),
      Cell.text('No spawned child agents.'),
    ],
  });
}

export async function expectSpawnUsesAwaitedSignal(): Promise<void> {
  const runtime = buildSubAgentCapabilityRuntime();
  const spawnTool = runtime.tools.find((tool) => tool.id === 'spawn-sub-agent');
  const result = await spawnTool?.invoke({ message: 'Tell me a joke.', referenceName: 'reviewer' });
  expect(runtime.spawned).toEqual([{ message: 'Tell me a joke.', referenceName: 'reviewer' }]);
  expect(runtime.registeredSignals[0]).toMatchObject({
    capabilityId: 'sub-agent',
    name: 'Sub-agent response',
  });
  expect(runtime.sentSignals[0]).toMatchObject({
    agentId: 'agents:child123',
    capabilityId: 'parent-link',
    data: {
      message: 'Tell me a joke.',
      parentAgentId: 'agents:parent123',
      parentCapabilityId: 'sub-agent',
      responseSignalId: 'signal-1',
      type: 'respond-parent',
    },
    name: 'Parent ask',
  });
  expect(result).toMatchObject({
    status: 'success',
    content: [Cell.text('Spawned agents:child123 and waiting for its response.')],
  });
}

export async function expectAskNormalizesChildId(): Promise<void> {
  const runtime = buildSubAgentCapabilityRuntime();
  await runtime.tools
    .find((tool) => tool.id === 'spawn-sub-agent')
    ?.invoke({
      message: 'Start.',
      referenceName: 'reviewer',
    });
  await runtime.tools
    .find((tool) => tool.id === 'ask-sub-agent')
    ?.invoke({
      childAgentId: 'child123',
      message: 'Another joke.',
    });
  expect(runtime.sentSignals[1]).toMatchObject({
    agentId: 'agents:child123',
    data: {
      message: 'Another joke.',
      responseSignalId: 'signal-2',
      type: 'respond-parent',
    },
  });
}

export async function expectParentResponseContinuesAwaitedChildAsk(): Promise<void> {
  const runtime = buildSubAgentCapabilityRuntime();
  await runtime.tools
    .find((tool) => tool.id === 'spawn-sub-agent')
    ?.invoke({
      message: 'Start.',
      referenceName: 'reviewer',
    });
  runtime.capability.hookOnSignal({
    agentId: 'agents:parent123',
    capabilityId: 'sub-agent',
    data: {
      childAgentId: 'agents:child123',
      message: 'Need the parent to decide.',
      responseSignalId: 'child-signal-1',
      type: 'ask-parent',
    },
    description: 'Child asked parent through awaited response.',
    id: 'agent-signals:received-parent-ask',
    kind: 'awaited',
    name: 'Sub-agent response',
    signalId: 'signal-1',
    status: 'received',
  });
  const result = await runtime.tools
    .find((tool) => tool.id === 'respond-to-child-agent')
    ?.invoke({
      childAgentId: 'child123',
      message: 'Use this answer.',
    });
  expect(runtime.registeredSignals[1]).toMatchObject({
    capabilityId: 'sub-agent',
    name: 'Sub-agent response',
  });
  expect(runtime.resolvedSignals[0]).toMatchObject({
    agentId: 'agents:child123',
    capabilityId: 'parent-link',
    data: {
      message: 'Use this answer.',
      parentAgentId: 'agents:parent123',
      parentCapabilityId: 'sub-agent',
      responseSignalId: 'signal-2',
      type: 'parent-response',
    },
    signalId: 'child-signal-1',
  });
  expect(result).toMatchObject({
    content: [Cell.text('Sent response to agents:child123 and waiting for its follow-up.')],
    status: 'success',
  });
}

function buildSubAgentCapabilityRuntime() {
  const agent = new PebbleAgent({
    agentId: 'agents:parent123',
    description: 'Parent agent',
    name: 'Parent',
    provider: new SignalTestProvider(),
    workspacePath: '',
  });
  const capability = new SubAgentCapability();
  const registeredSignals: RegisterSignalInput[] = [];
  const resolvedSignals: ResolveSignalInput[] = [];
  const sentSignals: SendSignalInput[] = [];
  const spawned: SubAgentSpawnInput[] = [];
  const signal: SignalRunner = {
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
  const subAgent: SubAgentRunner = {
    ask: async () => {
      throw new Error('not used');
    },
    awaitMessage: async () => {
      throw new Error('not used');
    },
    drain: () => [],
    kill: async () => undefined,
    list: () => [],
    send: async () => undefined,
    spawn: async (input) => {
      spawned.push(input);
      return 'agents:child123';
    },
  };
  installAgentBridge(agent, {
    signal,
    subAgent,
  });
  capability.attach(agent);
  const tools = capability.hookOnRegister({
    agents: [{ agentRegistryId: 'agent-registries:review', name: 'reviewer' }],
  }).tools;
  return { capability, registeredSignals, resolvedSignals, sentSignals, spawned, tools };
}
