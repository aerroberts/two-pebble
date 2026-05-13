import { describe, expect, test } from 'bun:test';
import {
  ollamaReadInput,
  openAiCreateInput,
  openAiInferenceProfileInput,
  openAiInferenceProfileUpdateInput,
} from '../testing/datastore-test-constants';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation inference-profiles.create', () => {
  test('happy: creates an inference profile for an integration', async () => {
    const datastore = await useDatastoreForTesting();
    const integration = await datastore.integrations.create(openAiCreateInput);
    const createInput = { ...openAiInferenceProfileInput, integrationId: integration.id };
    const profile = await datastore.inferenceProfiles.create(createInput);
    await datastore.close();
    expect(profile.data).toEqual({ model: 'gpt-test' });
  });
});

describe('feature: operation inference-profiles.delete', () => {
  test('happy: deletes an inference profile', async () => {
    const datastore = await useDatastoreForTesting();
    const integration = await datastore.integrations.create(openAiCreateInput);
    const createInput = { ...openAiInferenceProfileInput, integrationId: integration.id };
    const profile = await datastore.inferenceProfiles.create(createInput);
    await datastore.inferenceProfiles.delete({ id: profile.id });
    const list = await datastore.inferenceProfiles.list({ limit: 50, offset: 0 });
    await datastore.close();
    expect(list.items).toHaveLength(0);
  });
});

describe('feature: operation inference-profiles.list', () => {
  test('happy: lists inference profiles', async () => {
    const datastore = await useDatastoreForTesting();
    const integration = await datastore.integrations.create(openAiCreateInput);
    await datastore.inferenceProfiles.create({ ...openAiInferenceProfileInput, integrationId: integration.id });
    const list = await datastore.inferenceProfiles.list({ limit: 50, offset: 0 });
    await datastore.close();
    expect(list.items).toHaveLength(1);
  });
});

describe('feature: operation inference-profiles.read', () => {
  test('happy: reads an inference profile', async () => {
    const datastore = await useDatastoreForTesting();
    const integration = await datastore.integrations.create(openAiCreateInput);
    const createInput = { ...openAiInferenceProfileInput, integrationId: integration.id };
    const profile = await datastore.inferenceProfiles.create(createInput);
    const read = await datastore.inferenceProfiles.read({ id: profile.id });
    await datastore.close();
    expect(read.name).toBe('OpenAI GPT');
  });
});

describe('feature: operation inference-profiles.update', () => {
  test('happy: updates an inference profile', async () => {
    const datastore = await useDatastoreForTesting();
    const integration = await datastore.integrations.create(openAiCreateInput);
    const createInput = { ...openAiInferenceProfileInput, integrationId: integration.id };
    const profile = await datastore.inferenceProfiles.create(createInput);
    const updateInput = { ...openAiInferenceProfileUpdateInput, id: profile.id, integrationId: integration.id };
    const updated = await datastore.inferenceProfiles.update(updateInput);
    await datastore.close();
    expect(updated.data).toEqual({ model: 'gpt-updated' });
  });

  test('happy: rebinding the integration updates the derived provider', async () => {
    const datastore = await useDatastoreForTesting();
    const integration = await datastore.integrations.create(openAiCreateInput);
    const ollamaIntegration = await datastore.integrations.create(ollamaReadInput);
    const createInput = { ...openAiInferenceProfileInput, integrationId: integration.id };
    const profile = await datastore.inferenceProfiles.create(createInput);
    const updateInput = { ...openAiInferenceProfileUpdateInput, id: profile.id, integrationId: ollamaIntegration.id };
    const updated = await datastore.inferenceProfiles.update(updateInput);
    await datastore.close();
    expect(updated.provider).toBe(ollamaIntegration.provider);
  });
});
