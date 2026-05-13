import { describe, expect, test } from 'bun:test';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation app-settings.read', () => {
  test('happy: returns defaults when no row exists', async () => {
    const datastore = await useDatastoreForTesting();
    const settings = await datastore.appSettings.read({});
    await datastore.close();
    expect(settings.defaultTranscriptionProfileId).toBeNull();
    expect(settings.defaultSpeechProfileId).toBeNull();
    expect(settings.assistantAgentRegistryId).toBeNull();
    expect(settings.assistantAgentId).toBeNull();
  });
});

describe('feature: operation app-settings.update', () => {
  test('happy: upserts all settings including assistant agent fields', async () => {
    const datastore = await useDatastoreForTesting();
    const updated = await datastore.appSettings.update({
      defaultTranscriptionProfileId: 'profile-1',
      defaultSpeechProfileId: 'profile-2',
      assistantAgentRegistryId: 'registry-1',
      assistantAgentId: 'agent-1',
    });
    await datastore.close();
    expect(updated.defaultTranscriptionProfileId).toBe('profile-1');
    expect(updated.defaultSpeechProfileId).toBe('profile-2');
    expect(updated.assistantAgentRegistryId).toBe('registry-1');
    expect(updated.assistantAgentId).toBe('agent-1');
  });

  test('happy: clearing assistantAgentId persists null', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.appSettings.update({
      defaultTranscriptionProfileId: null,
      defaultSpeechProfileId: null,
      assistantAgentRegistryId: 'registry-1',
      assistantAgentId: 'agent-1',
    });
    const cleared = await datastore.appSettings.update({
      defaultTranscriptionProfileId: null,
      defaultSpeechProfileId: null,
      assistantAgentRegistryId: 'registry-1',
      assistantAgentId: null,
    });
    await datastore.close();
    expect(cleared.assistantAgentRegistryId).toBe('registry-1');
    expect(cleared.assistantAgentId).toBeNull();
  });
});
