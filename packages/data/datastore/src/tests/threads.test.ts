import { describe, expect, test } from 'bun:test';
import { conversationCellRecordInput } from '../testing/datastore-test-constants';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation threads.list', () => {
  test('happy: lists conversation threads with cell counts', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create({
      description: 'Thread agent',
      name: 'Thread Agent',
      projectId: 'proj_default',
      workspaceId: 'w',
    });
    await datastore.agent.conversationCells.record({ ...conversationCellRecordInput, agentId: agent.id });
    const threads = await datastore.threads.list({});
    await datastore.close();
    expect(threads.items).toHaveLength(1);
  });
});
