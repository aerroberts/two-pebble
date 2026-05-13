import { describe, expect, test } from 'bun:test';
import {
  ollamaReadInput,
  openAiCreateInput,
  openAiDeleteInput,
  openAiListInput,
  openAiUpdateCreateInput,
  openAiUpdateInput,
  wrongProviderUpdateInput,
} from '../testing/datastore-test-constants';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation integrations.create', () => {
  test('happy: creates an integration', async () => {
    const datastore = await useDatastoreForTesting();
    const integration = await datastore.integrations.create(openAiCreateInput);
    await datastore.close();
    expect(integration).toMatchObject({ data: { apiKey: 'sk-test' }, provider: 'openai' });
  });
});

describe('feature: operation integrations.delete', () => {
  test('happy: deletes an integration', async () => {
    const datastore = await useDatastoreForTesting();
    const integration = await datastore.integrations.create(openAiDeleteInput);
    await datastore.integrations.delete({ id: integration.id });
    const list = await datastore.integrations.list({ limit: 50, offset: 0 });
    await datastore.close();
    expect(list.items).toHaveLength(0);
  });
});

describe('feature: operation integrations.list', () => {
  test('happy: lists integrations', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.integrations.create(openAiListInput);
    const list = await datastore.integrations.list({ limit: 50, offset: 0 });
    await datastore.close();
    expect(list.items).toHaveLength(1);
  });
});

describe('feature: operation integrations.read', () => {
  test('happy: reads an integration', async () => {
    const datastore = await useDatastoreForTesting();
    const created = await datastore.integrations.create(ollamaReadInput);
    const integration = await datastore.integrations.read({ id: created.id });
    await datastore.close();
    expect(integration).toMatchObject({
      data: { baseUrl: 'http://localhost:11434' },
      provider: 'ollama',
    });
  });
});

describe('feature: operation integrations.update', () => {
  test('happy: updates integration name and data', async () => {
    const datastore = await useDatastoreForTesting();
    const integration = await datastore.integrations.create(openAiUpdateCreateInput);
    const updated = await datastore.integrations.update({
      id: integration.id,
      ...openAiUpdateInput,
    });
    await datastore.close();
    expect(updated.name).toBe('OpenAI');
  });

  test('unhappy: rejects provider changes', async () => {
    const datastore = await useDatastoreForTesting();
    const integration = await datastore.integrations.create(ollamaReadInput);
    const update = datastore.integrations.update({
      id: integration.id,
      ...wrongProviderUpdateInput,
    });
    await expect(update).rejects.toThrow();
    await datastore.close();
  });
});
