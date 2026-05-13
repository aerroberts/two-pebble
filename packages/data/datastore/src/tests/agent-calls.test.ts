import { describe, expect, test } from 'bun:test';
import { readFullThreadSnapshot, readPointerThreadSnapshot } from '../testing/agent-conversation-cells-test-env';
import { priceLineItemRecord, recordPriceLineItem } from '../testing/agent-price-line-items-test-env';
import {
  callListAgentInput,
  callListInput,
  callReadAgentInput,
  callReadInput,
  callRecordAgentInput,
  callRecordInput,
  conversationCellAgentInput,
  conversationCellRecordInput,
} from '../testing/datastore-test-constants';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation agent.calls.list', () => {
  test('happy: lists call metadata for one agent', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create(callListAgentInput);
    await datastore.agent.calls.record({ ...callListInput, agentId: agent.id });
    const list = await datastore.agent.calls.list({ agentId: agent.id, limit: 50, offset: 0 });
    await datastore.close();
    expect(list.items).toHaveLength(1);
  });
});

describe('feature: operation agent.calls.read', () => {
  test('happy: reads full call payload by id', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create(callReadAgentInput);
    const call = await datastore.agent.calls.record({ ...callReadInput, agentId: agent.id });
    const read = await datastore.agent.calls.read({ id: call.id });
    await datastore.close();
    expect(read.data).toEqual({ hidden: true });
  });
});

describe('feature: operation agent.calls.record', () => {
  test('happy: records a model call', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create(callRecordAgentInput);
    const call = await datastore.agent.calls.record({ ...callRecordInput, agentId: agent.id });
    await datastore.close();
    expect(call.id).toBe('model-call-record');
    expect(call.modelId).toBe('gpt-record');
  });
});

describe('feature: operation agent.price-line-items.record', () => {
  test('happy: records model call price line items', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create(callRecordAgentInput);
    const call = await datastore.agent.calls.record({ ...callRecordInput, agentId: agent.id });
    const lineItem = await recordPriceLineItem({ agentId: agent.id, callId: call.id, datastore });
    await datastore.close();

    expect(lineItem).toMatchObject(priceLineItemRecord({ agentId: agent.id, callId: call.id }));
    expect(lineItem.id.length).toBeGreaterThan(0);
  });
});

describe('feature: operation agent.price-line-items.list', () => {
  test('happy: lists model call price line items', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create(callRecordAgentInput);
    const call = await datastore.agent.calls.record({ ...callRecordInput, agentId: agent.id });
    const lineItem = await recordPriceLineItem({ agentId: agent.id, callId: call.id, datastore });
    const lineItems = await datastore.agent.priceLineItems.list({ agentId: agent.id });
    await datastore.close();

    expect(lineItems.items).toEqual([lineItem]);
  });
});

describe('feature: operation agent.conversation.cells.record', () => {
  test('happy: records an append-only conversation cell', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create(conversationCellAgentInput);
    const cell = await datastore.agent.conversationCells.record({ ...conversationCellRecordInput, agentId: agent.id });
    await datastore.close();
    expect(cell).toMatchObject({
      orderId: 1,
      content: conversationCellRecordInput.content,
      label: 'User Message',
      threadId: 'thread-test',
    });
  });
});

describe('feature: operation agent.conversation.cells.snapshot', () => {
  test('happy: reads thread cells up to a snapshot pointer', async () => {
    const snapshot = await readPointerThreadSnapshot();

    expect(snapshot.items.map((cell) => cell.orderId)).toEqual([1, 2]);
    expect(snapshot.items.map((cell) => cell.role)).toEqual(['user', 'assistant']);
    expect(snapshot.items.map((cell) => cell.label)).toEqual(['User Message', 'Assistant Message']);
    expect(snapshot.items.map((cell) => cell.content[0])).toEqual([
      { type: 'text', content: { text: 'hello' } },
      { type: 'text', content: { text: 'second' } },
    ]);
  });

  test('happy: reads the full thread when no snapshot pointer is provided', async () => {
    const snapshot = await readFullThreadSnapshot();

    expect(snapshot.orderId).toBeNull();
    expect(snapshot.items.map((cell) => cell.orderId)).toEqual([1, 2]);
  });
});
