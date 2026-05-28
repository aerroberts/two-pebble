import { describe, expect, test } from 'bun:test';
import { Cell } from '@two-pebble/pebble';
import { seedQueuedAgentMessage } from '../testing/agent-queued-messages-test-env';
import { firstAgentInput, secondAgentInput } from '../testing/datastore-test-constants';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation agent.queued-messages.enqueue', () => {
  test('happy: enqueues a queued message', async () => {
    const datastore = await useDatastoreForTesting();
    const { message } = await seedQueuedAgentMessage(datastore);
    await datastore.close();
    expect(message.status).toBe('queued');
  });
});

describe('feature: operation agent.queued-messages.peek-next', () => {
  test('happy: peeks queued messages in FIFO order', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create(firstAgentInput);
    const first = await datastore.agent.queuedMessages.enqueue({
      agentId: agent.id,
      cells: [Cell.text('first')],
    });
    await Bun.sleep(2);
    await datastore.agent.queuedMessages.enqueue({
      agentId: agent.id,
      cells: [Cell.text('second')],
    });

    const next = await datastore.agent.queuedMessages.peekNext({ agentId: agent.id });
    await datastore.close();

    expect(next?.id).toBe(first.id);
  });
});

describe('feature: operation agent.queued-messages.mark-sent', () => {
  test('happy: marks a queued message sent', async () => {
    const datastore = await useDatastoreForTesting();
    const { message } = await seedQueuedAgentMessage(datastore);
    const sent = await datastore.agent.queuedMessages.markSent({ id: message.id });
    const secondMark = await datastore.agent.queuedMessages.markSent({ id: message.id });
    await datastore.close();

    expect(sent.status).toBe('sent');
    expect(sent.sentAt).not.toBeNull();
    expect(secondMark.status).toBe('sent');
  });
});

describe('feature: operation agent.queued-messages.mark-failed', () => {
  test('happy: marks a queued message failed', async () => {
    const datastore = await useDatastoreForTesting();
    const { message } = await seedQueuedAgentMessage(datastore);
    const failed = await datastore.agent.queuedMessages.markFailed({ id: message.id, error: 'boom' });
    await datastore.close();

    expect(failed.status).toBe('failed');
    expect(failed.lastError).toBe('boom');
  });
});

describe('feature: operation agent.queued-messages.cancel', () => {
  test('happy: deletes a queued message', async () => {
    const datastore = await useDatastoreForTesting();
    const { agent, message } = await seedQueuedAgentMessage(datastore);
    const canceled = await datastore.agent.queuedMessages.cancel({ id: message.id });
    const list = await datastore.agent.queuedMessages.listForAgent({ agentId: agent.id });
    await datastore.close();

    expect(canceled).toEqual({ deleted: true, id: message.id });
    expect(list.items).toEqual([]);
  });

  test('happy: sent messages are not canceled', async () => {
    const datastore = await useDatastoreForTesting();
    const { agent, message } = await seedQueuedAgentMessage(datastore);
    await datastore.agent.queuedMessages.markSent({ id: message.id });
    const canceled = await datastore.agent.queuedMessages.cancel({ id: message.id });
    const list = await datastore.agent.queuedMessages.listForAgent({ agentId: agent.id });
    await datastore.close();

    expect(canceled).toEqual({ deleted: false, id: message.id });
    expect(list.items.map((item) => item.id)).toEqual([message.id]);
  });
});

describe('feature: operation agent.queued-messages.list-for-agent', () => {
  test('happy: lists queued messages for one agent', async () => {
    const datastore = await useDatastoreForTesting();
    const { agent } = await seedQueuedAgentMessage(datastore);
    const other = await datastore.agent.create(secondAgentInput);
    await datastore.agent.queuedMessages.enqueue({ agentId: other.id, cells: [Cell.text('other')] });

    const list = await datastore.agent.queuedMessages.listForAgent({ agentId: agent.id });
    await datastore.close();

    expect(list.items.map((item) => item.agentId)).toEqual([agent.id]);
  });
});

describe('feature: operation agent.queued-messages.list-idle-agents-with-work', () => {
  test('happy: lists only idle agents with queued work', async () => {
    const datastore = await useDatastoreForTesting();
    const idle = await datastore.agent.create(firstAgentInput);
    const running = await datastore.agent.create(secondAgentInput);
    await datastore.agent.setStatus({ id: running.id, status: 'running' });
    await datastore.agent.queuedMessages.enqueue({ agentId: idle.id, cells: [Cell.text('idle')] });
    await datastore.agent.queuedMessages.enqueue({ agentId: running.id, cells: [Cell.text('running')] });

    const ids = await datastore.agent.queuedMessages.listIdleAgentsWithWork();
    await datastore.close();

    expect(ids).toEqual([idle.id]);
  });
});
