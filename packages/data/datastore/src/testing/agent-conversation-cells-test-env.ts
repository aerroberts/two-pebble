import type { CellContent, ConversationThreadCell, DataCells } from '@two-pebble/pebble';
import { conversationCellAgentInput, conversationCellRecordInput } from './datastore-test-constants';
import { useDatastoreForTesting } from './datastore-test-env';

type TestDatastore = Awaited<ReturnType<typeof useDatastoreForTesting>>;
type TestThreadRole = ConversationThreadCell['role'];

interface TestThreadCellInput {
  agentId: string;
  orderId: number;
  content: DataCells;
  label?: string;
  role: TestThreadRole;
  threadId?: string;
}

/**
 * Exposes this datastore module contract for package-local callers.
 */
export async function useConversationCellFixture() {
  const datastore = await useDatastoreForTesting();
  const agent = await datastore.agent.create(conversationCellAgentInput);

  return { agent, datastore };
}

/**
 * Exposes this datastore module contract for package-local callers.
 */
export async function recordSnapshotScenario(datastore: TestDatastore, agentId: string) {
  await datastore.agent.conversationCells.record({ ...conversationCellRecordInput, agentId });
  await recordThreadCell(datastore, { agentId, orderId: 2, content: [textCell('second')], role: 'assistant' });
  await recordThreadCell(datastore, { agentId, orderId: 3, content: [textCell('third')], role: 'user' });
  await recordThreadCell(datastore, {
    agentId,
    orderId: 1,
    content: [textCell('other')],
    role: 'cache',
    threadId: 'other-thread',
  });
}

/**
 * Exposes this datastore module contract for package-local callers.
 */
export async function recordSecondThreadCell(datastore: TestDatastore, agentId: string) {
  await recordThreadCell(datastore, {
    agentId,
    orderId: 2,
    content: [textCell('second')],
    role: 'assistant',
  });
}

/**
 * Exposes this datastore module contract for package-local callers.
 */
export async function readPointerThreadSnapshot() {
  const { agent, datastore } = await useConversationCellFixture();
  await recordSnapshotScenario(datastore, agent.id);
  const snapshot = await datastore.agent.conversationCells.snapshot({ orderId: 2, threadId: 'thread-test' });
  await datastore.close();

  return snapshot;
}

/**
 * Exposes this datastore module contract for package-local callers.
 */
export async function readFullThreadSnapshot() {
  const { agent, datastore } = await useConversationCellFixture();
  await datastore.agent.conversationCells.record({ ...conversationCellRecordInput, agentId: agent.id });
  await recordSecondThreadCell(datastore, agent.id);
  const snapshot = await datastore.agent.conversationCells.snapshot({ threadId: 'thread-test' });
  await datastore.close();

  return snapshot;
}

async function recordThreadCell(datastore: TestDatastore, input: TestThreadCellInput) {
  await datastore.agent.conversationCells.record({
    ...input,
    label: input.label ?? labelForRole(input.role),
    threadId: input.threadId ?? 'thread-test',
  });
}

function textCell(text: string): CellContent {
  return { type: 'text', content: { text } };
}

function labelForRole(role: TestThreadRole) {
  switch (role) {
    case 'assistant':
      return 'Assistant Message';
    case 'cache':
    case 'system':
      return 'System Prompt';
    case 'user':
      return 'User Message';
  }
}
