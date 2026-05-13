import { describe, expect, test } from 'bun:test';
import { clearAssistantAgentSetting, writeFullAppSettings } from '../testing/app-settings-test-env';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation app-settings.read', () => {
  test('happy: returns defaults when no row exists', async () => {
    const datastore = await useDatastoreForTesting();
    const settings = await datastore.appSettings.read({});
    await datastore.close();
    expect(settings).toMatchObject({
      defaultTranscriptionProfileId: null,
      defaultSpeechProfileId: null,
      assistantAgentRegistryId: null,
      assistantAgentId: null,
    });
  });
});

describe('feature: operation app-settings.update', () => {
  test('happy: upserts all settings including assistant agent fields', async () => {
    const updated = await writeFullAppSettings();
    expect(updated).toMatchObject({
      defaultTranscriptionProfileId: 'profile-1',
      defaultSpeechProfileId: 'profile-2',
      assistantAgentRegistryId: 'registry-1',
      assistantAgentId: 'agent-1',
    });
  });

  test('happy: clearing assistantAgentId persists null', async () => {
    const cleared = await clearAssistantAgentSetting();
    expect(cleared).toMatchObject({ assistantAgentRegistryId: 'registry-1', assistantAgentId: null });
  });
});
