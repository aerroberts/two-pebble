import { describe, expect, it } from 'bun:test';
import { Cell } from '../../thread';
import { aggregatePebbleAgentTraces } from './aggregate-pebble-agent-traces';
import {
  modelCallStartFixture,
  pendingModelCallExpectation,
  singleTrace,
  subAgentInvokeFixture,
  subAgentLifecycleTraces,
  subAgentNoTimingExpectation,
  subAgentSuccessExpectation,
  subAgentSuccessFixture,
  taskListUpdateFixture,
  testTrace,
  toolCallStartFixture,
  toolCallSuccessFixture,
  turnStartFixture,
} from './trace-aggregator.test-env';

describe('feature: pebble trace aggregation', () => {
  it('happy: collapses tool lifecycle traces into one tool trace', () => {
    const start = testTrace({ createdAt: 100, ...toolCallStartFixture('read', { path: 'src/index.ts' }) });
    const end = testTrace({ createdAt: 112, orderId: 2, ...toolCallSuccessFixture('file contents') });
    const traces = aggregatePebbleAgentTraces([start, end]);
    expect(traces).toHaveLength(1);
    expect(traces[0]).toMatchObject({
      type: 'tool',
      data: { duration: 12, input: { path: 'src/index.ts' }, status: 'success', toolCallId: 'call-1', toolId: 'read' },
    });
  });

  it('happy: collapses model call lifecycle traces into one linked outcome trace', () => {
    const start = testTrace(modelCallStartFixture());
    const end = testTrace({ orderId: 2, type: 'model-call-success', data: { modelCallId: 'model-call-1' } });
    const traces = aggregatePebbleAgentTraces([start, end]);
    expect(traces).toHaveLength(1);
    expect(traces[0]).toMatchObject({
      createdAt: 1,
      orderId: 1,
      type: 'model-call-success',
      data: { duration: 1, modelCallId: 'model-call-1', modelId: 'gpt-test', provider: 'openai' },
    });
  });

  it('happy: renders pending tool traces from a request without a response', () => {
    const traces = aggregatePebbleAgentTraces([testTrace(toolCallStartFixture('echo', { value: 'hello' }))]);
    expect(traces[0]).toMatchObject({
      type: 'tool',
      data: { input: { value: 'hello' }, status: 'pending', toolCallId: 'call-1', toolId: 'echo' },
    });
  });

  it('happy: keeps collapsed tool traces at the start event order', () => {
    const traces = aggregatePebbleAgentTraces([
      testTrace({ createdAt: 100, orderId: 1, type: 'user-message', data: { content: [Cell.text('go')] } }),
      testTrace({ createdAt: 500, orderId: 2, ...toolCallStartFixture('echo', { value: 'hello' }) }),
      testTrace({ createdAt: 200, orderId: 3, type: 'assistant-message', data: { content: [Cell.text('mid')] } }),
      testTrace({ createdAt: 700, orderId: 4, ...toolCallSuccessFixture('done') }),
    ]);
    expect(traces.map((trace) => trace.type)).toEqual(['user-message', 'tool', 'assistant-message']);
    expect(traces[1]).toMatchObject({ createdAt: 500, orderId: 2, type: 'tool' });
  });

  it('happy: keeps pending model call traces when no outcome references the start trace', () => {
    const traces = aggregatePebbleAgentTraces([testTrace(modelCallStartFixture())]);
    expect(traces[0]).toMatchObject(pendingModelCallExpectation);
  });

  it('happy: collapses sub-agent lifecycle traces into one sub-agent trace', () => {
    const start = testTrace({ createdAt: 100, ...subAgentInvokeFixture() });
    const end = testTrace({ createdAt: 130, orderId: 2, ...subAgentSuccessFixture() });
    const traces = aggregatePebbleAgentTraces([start, end]);
    expect(traces).toHaveLength(1);
    expect(traces[0]).toMatchObject(subAgentSuccessExpectation);
  });

  it('happy: does not put computed timing into sub-agent trace data', () => {
    const trace = singleTrace(aggregatePebbleAgentTraces(subAgentLifecycleTraces(160)));
    expect(trace).toMatchObject(subAgentNoTimingExpectation);
    expect(trace.data).not.toHaveProperty('duration');
  });

  it('happy: collapses task-list-update traces within a turn to the last one', () => {
    const traces = aggregatePebbleAgentTraces([
      testTrace({ orderId: 1, ...turnStartFixture(1) }),
      testTrace({ orderId: 2, ...taskListUpdateFixture('a', 'pending') }),
      testTrace({ orderId: 3, ...taskListUpdateFixture('a', 'open') }),
      testTrace({ orderId: 4, ...taskListUpdateFixture('a', 'completed') }),
    ]);
    const taskTypes = traces.filter((trace) => trace.type === 'task-list-update');
    expect(taskTypes).toHaveLength(1);
    expect(taskTypes[0]).toMatchObject({ data: { tasks: [{ id: 'a', status: 'completed' }] } });
  });

  it('happy: keeps one task-list-update per turn across turn boundaries', () => {
    const traces = aggregatePebbleAgentTraces([
      testTrace({ orderId: 1, ...turnStartFixture(1) }),
      testTrace({ orderId: 2, ...taskListUpdateFixture('a', 'pending') }),
      testTrace({ orderId: 3, ...taskListUpdateFixture('a', 'open') }),
      testTrace({ orderId: 4, ...turnStartFixture(2) }),
      testTrace({ orderId: 5, ...taskListUpdateFixture('a', 'completed') }),
    ]);
    const taskTypes = traces.filter((trace) => trace.type === 'task-list-update');
    expect(taskTypes).toHaveLength(2);
  });

  it('happy: keeps every task-list-update when the thread has no turn-start markers', () => {
    const traces = aggregatePebbleAgentTraces([
      testTrace({ orderId: 1, ...taskListUpdateFixture('a', 'pending') }),
      testTrace({ orderId: 2, ...taskListUpdateFixture('a', 'open') }),
      testTrace({ orderId: 3, ...taskListUpdateFixture('a', 'completed') }),
    ]);
    const taskTypes = traces.filter((trace) => trace.type === 'task-list-update');
    expect(taskTypes).toHaveLength(3);
  });
});
