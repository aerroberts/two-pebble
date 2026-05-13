import { describe, expect, test } from 'bun:test';
import {
  traceListAgentInput,
  traceListInput,
  traceRecordAgentInput,
  traceRecordInput,
} from '../testing/datastore-test-constants';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation agent.traces.list', () => {
  test('happy: lists traces for an agent', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create(traceListAgentInput);
    await datastore.agent.traces.record({ ...traceListInput, agentId: agent.id });
    const list = await datastore.agent.traces.list({ agentId: agent.id, limit: 50, offset: 0 });
    await datastore.close();
    expect(list.items).toHaveLength(1);
  });
});

describe('feature: operation agent.traces.record', () => {
  test('happy: records an ordered trace', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create(traceRecordAgentInput);
    const trace = await datastore.agent.traces.record({ ...traceRecordInput, agentId: agent.id });
    await datastore.close();
    expect(trace.id).toBe('trace-record');
    expect(trace.type).toBe('user-message');
  });
});
