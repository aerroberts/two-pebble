import { expect } from 'bun:test';
import type { RegisterSignalInput, ResolveSignalInput, SendSignalInput, SignalRunner } from '../../../agent';
import { PebbleAgent } from '../../../agent/agents/pebble-agent';
import { SignalTestProvider } from '../../../agent/agents/signal-test-provider';
import { installCapabilityRunners } from '../../../capabilities';
import { Cell } from '../../../thread';
import type { PebbleAgentTrace } from '../../../traces';
import { ParentLinkCapability } from '../parent-link-capability';

export async function expectAskParentUsesPendingResponseSignal(): Promise<void> {
  const runtime = buildParentLinkRuntime();
  runtime.capability.hookOnSignal(parentAskSignal());
  const result = await runtime.tools
    .find((tool) => tool.id === 'ask-parent-agent')
    ?.invoke({
      message: 'Could you decide this?',
    });
  expect(runtime.registeredSignals[0]).toMatchObject({
    capabilityId: 'parent-link',
    name: 'Parent response',
  });
  expect(runtime.resolvedSignals[0]).toMatchObject({
    agentId: 'agents:parent123',
    capabilityId: 'sub-agent',
    data: {
      childAgentId: 'agents:child123',
      message: 'Could you decide this?',
      responseSignalId: 'signal-1',
      type: 'ask-parent',
    },
    signalId: 'parent-signal-1',
  });
  expect(runtime.sentSignals).toEqual([]);
  expect(result).toMatchObject({
    content: [Cell.text('Asked parent agent through the pending response signal and waiting.')],
    status: 'success',
  });
}

export async function expectParentResponseRestoresPendingParentReply(): Promise<void> {
  const runtime = buildParentLinkRuntime();
  runtime.capability.hookOnSignal({
    agentId: 'agents:child123',
    capabilityId: 'parent-link',
    data: {
      message: 'Use this answer.',
      parentAgentId: 'agents:parent123',
      parentCapabilityId: 'sub-agent',
      responseSignalId: 'parent-signal-2',
      type: 'parent-response',
    },
    description: 'Parent answered child.',
    id: 'agent-signals:parent-response',
    kind: 'awaited',
    name: 'Parent response',
    signalId: 'child-signal-1',
    status: 'received',
  });
  const result = await runtime.tools
    .find((tool) => tool.id === 'respond-to-parent-agent')
    ?.invoke({
      message: 'Final child answer.',
    });
  expect(runtime.resolvedSignals[0]).toMatchObject({
    agentId: 'agents:parent123',
    capabilityId: 'sub-agent',
    data: {
      childAgentId: 'agents:child123',
      message: 'Final child answer.',
      type: 'sub-agent-response',
    },
    signalId: 'parent-signal-2',
  });
  expect(result).toMatchObject({
    content: [Cell.text('Sent response to parent.')],
    status: 'success',
  });
}

export function expectParentAskAddsIncomingMessageTrace(): void {
  const runtime = buildParentLinkRuntime();
  runtime.capability.hookOnSignal(parentAskSignal());
  expect(runtime.traces).toContainEqual({
    type: 'parent-message',
    data: {
      content: [
        Cell.header2('Parent Agent Ask'),
        Cell.text('Answer the parent.'),
        Cell.text('Respond with respond-to-parent-agent before exiting.'),
      ],
      direction: 'ask',
      parentAgentId: 'agents:parent123',
    },
  });
}

function buildParentLinkRuntime() {
  const agent = new PebbleAgent({
    agentId: 'agents:child123',
    description: 'Child agent',
    name: 'Child',
    provider: new SignalTestProvider(),
    workspacePath: '',
  });
  const capability = new ParentLinkCapability();
  const registeredSignals: RegisterSignalInput[] = [];
  const resolvedSignals: ResolveSignalInput[] = [];
  const sentSignals: SendSignalInput[] = [];
  const traces: PebbleAgentTrace[] = [];
  agent.on('trace', (trace) => {
    traces.push(trace);
  });
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
  installCapabilityRunners(agent, { signal });
  capability.attach(agent);
  capability.initialize({ parentAgentId: 'agents:parent123' });
  const tools = capability.hookOnRegister().tools;
  return { capability, registeredSignals, resolvedSignals, sentSignals, tools, traces };
}

function parentAskSignal() {
  return {
    agentId: 'agents:child123',
    capabilityId: 'parent-link',
    data: {
      message: 'Answer the parent.',
      parentAgentId: 'agents:parent123',
      parentCapabilityId: 'sub-agent',
      responseSignalId: 'parent-signal-1',
      type: 'respond-parent',
    },
    description: 'Parent asked child.',
    id: 'agent-signals:parent-ask',
    kind: 'push' as const,
    name: 'Parent ask',
    signalId: 'push-signal-1',
    status: 'received' as const,
  };
}
