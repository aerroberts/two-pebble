import { Cell } from '../../thread';
import type { PebbleJsonRecord } from '../../types';
import type { TaskListUpdateStatus } from '../agent-traces/task-list-update';
import type { PebbleAgentTrace } from '../types';

type TestTrace = PebbleAgentTrace & {
  createdAt: number;
  id: string;
  orderId: number;
};

type TestTraceInput = PebbleAgentTrace & {
  createdAt?: number;
  orderId?: number;
};

export function testTrace(trace: TestTraceInput): TestTrace {
  return {
    createdAt: trace.createdAt ?? trace.orderId ?? 1,
    id: `trace-${trace.orderId ?? 1}`,
    orderId: trace.orderId ?? 1,
    ...trace,
  };
}

export function toolCallStartFixture(toolId: string, input: PebbleJsonRecord) {
  return { type: 'tool-call-start' as const, data: { callId: 'call-1', input, toolId } };
}

export function toolCallSuccessFixture(text: string) {
  return { type: 'tool-call-success' as const, data: { result: [Cell.text(text)], toolCallId: 'call-1' } };
}

export function modelCallStartFixture() {
  return {
    type: 'model-call-start' as const,
    data: { modelCallId: 'model-call-1', modelId: 'gpt-test', provider: 'openai', threadCursor: 'thread-test/4' },
  };
}

export function subAgentInvokeFixture() {
  return {
    type: 'sub-agent-invoke' as const,
    data: {
      agentInstanceId: 'agent-1',
      agentTemplateId: 'general-purpose',
      input: [Cell.text('Inspect the pricing path.')],
    },
  };
}

export function subAgentSuccessFixture() {
  return {
    type: 'sub-agent-success' as const,
    data: {
      agentInstanceId: 'agent-1',
      output: [Cell.text('Pricing path inspected.')],
    },
  };
}

export const pendingModelCallExpectation = {
  type: 'model-call-start',
  data: { modelCallId: 'model-call-1', modelId: 'gpt-test', provider: 'openai', threadCursor: 'thread-test/4' },
};

export const subAgentSuccessExpectation = {
  type: 'sub-agent',
  data: {
    agentInstanceId: 'agent-1',
    agentTemplateId: 'general-purpose',
    status: 'success',
  },
};

export const subAgentNoTimingExpectation = {
  createdAt: 100,
  type: 'sub-agent',
  data: { status: 'success' },
};

export function singleTrace<T>(traces: T[]) {
  const trace = traces[0];
  if (trace === undefined || traces.length !== 1) {
    throw new Error('Expected one aggregated trace.');
  }
  return trace;
}

export function subAgentLifecycleTraces(outcomeCreatedAt: number) {
  return [
    testTrace({ createdAt: 100, ...subAgentInvokeFixture() }),
    testTrace({ createdAt: outcomeCreatedAt, orderId: 2, ...subAgentSuccessFixture() }),
  ];
}

export function taskListUpdateFixture(taskId: string, status: TaskListUpdateStatus) {
  return {
    type: 'task-list-update' as const,
    data: {
      tasks: [{ id: taskId, status, description: `Task ${taskId}` }],
      changes: [{ id: taskId, oldStatus: null, newStatus: status }],
    },
  };
}

export function turnStartFixture(step: number) {
  return { type: 'turn-start' as const, data: { step } };
}

export function orderedToolLifecycleTraces(): TestTrace[] {
  const userMsg = testTrace({ createdAt: 100, orderId: 1, type: 'user-message', data: { content: [Cell.text('go')] } });
  const start = testTrace({ createdAt: 500, orderId: 2, ...toolCallStartFixture('echo', { value: 'hello' }) });
  const assistantMsg = testTrace({
    createdAt: 200,
    orderId: 3,
    type: 'assistant-message',
    data: { content: [Cell.text('mid')] },
  });
  const end = testTrace({ createdAt: 700, orderId: 4, ...toolCallSuccessFixture('done') });
  return [userMsg, start, assistantMsg, end];
}
