import { Cell } from '@two-pebble/pebble';
import type { Datastore } from '../datastore';
import { firstAgentInput } from './datastore-test-constants';

/**
 * Exposes this datastore module contract for package-local callers.
 */
export async function seedQueuedAgentMessage(datastore: Datastore) {
  const agent = await datastore.agent.create(firstAgentInput);
  const message = await datastore.agent.queuedMessages.enqueue({
    agentId: agent.id,
    cells: [Cell.text('queued message')],
  });
  return { agent, message };
}
