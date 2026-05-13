import { describe, expect, test } from 'bun:test';
import { seedAgentSignal, seedPushAgentSignal, seedReceivedAgentSignal } from '../testing/agent-signals-test-env';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation agent.signals.register', () => {
  test('happy: registers an awaited signal', async () => {
    const datastore = await useDatastoreForTesting();
    const { signal } = await seedAgentSignal(datastore);
    await datastore.close();
    expect(signal.status).toBe('open');
  });
});

describe('feature: operation agent.signals.list-for-agent', () => {
  test('happy: lists all signals for an agent', async () => {
    const datastore = await useDatastoreForTesting();
    const { agent } = await seedAgentSignal(datastore);
    const list = await datastore.agent.signals.listForAgent({ agentId: agent.id });
    await datastore.close();
    expect(list.items.map((item) => item.signalId)).toEqual(['signal-1']);
  });
});

describe('feature: operation agent.signals.list-open-for-agent', () => {
  test('happy: lists open awaited signals', async () => {
    const datastore = await useDatastoreForTesting();
    const { agent } = await seedAgentSignal(datastore);
    const open = await datastore.agent.signals.listOpenForAgent({ agentId: agent.id });
    await datastore.close();
    expect(open.items.map((item) => item.signalId)).toEqual(['signal-1']);
  });
});

describe('feature: operation agent.signals.list-received-for-agent', () => {
  test('happy: lists received push signals', async () => {
    const datastore = await useDatastoreForTesting();
    const { agent } = await seedPushAgentSignal(datastore);
    const received = await datastore.agent.signals.listReceivedForAgent({ agentId: agent.id });
    await datastore.close();
    expect(received.items[0]?.kind).toBe('push');
  });
});

describe('feature: operation agent.signals.resolve', () => {
  test('happy: resolves awaited signals', async () => {
    const datastore = await useDatastoreForTesting();
    const { received } = await seedReceivedAgentSignal(datastore);
    await datastore.close();
    expect(received.status).toBe('received');
  });
});

describe('feature: operation agent.signals.mark-resolved', () => {
  test('happy: marks a received signal resolved', async () => {
    const datastore = await useDatastoreForTesting();
    const { received } = await seedReceivedAgentSignal(datastore);
    const resolved = await datastore.agent.signals.markResolved({ id: received.id });
    await datastore.close();
    expect(resolved.status).toBe('resolved');
  });
});

describe('feature: operation agent.signals.send-push', () => {
  test('happy: sends push signals as received', async () => {
    const datastore = await useDatastoreForTesting();
    const { signal } = await seedPushAgentSignal(datastore);
    await datastore.close();
    expect(signal.status).toBe('received');
  });
});
