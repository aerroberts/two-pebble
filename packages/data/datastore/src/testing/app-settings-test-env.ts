import { useDatastoreForTesting } from './datastore-test-env';

/**
 * Writes every app setting field with a non-null value.
 *
 * The helper keeps the operation test focused on persisted output.
 */
export async function writeFullAppSettings() {
  const datastore = await useDatastoreForTesting();
  const updated = await datastore.appSettings.update({
    defaultTranscriptionProfileId: 'profile-1',
    defaultSpeechProfileId: 'profile-2',
    assistantAgentRegistryId: 'registry-1',
    assistantAgentId: 'agent-1',
  });
  await datastore.close();
  return updated;
}

/**
 * Persists a populated settings row and then clears the assistant agent id.
 *
 * The returned row proves nullable app settings remain nullable on update.
 */
export async function clearAssistantAgentSetting() {
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
  return cleared;
}
