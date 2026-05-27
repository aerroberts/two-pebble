import { Header, PageLayout, ProviderLogo, Section, Select, type SelectOption, Surface } from '@two-pebble/components';
import type { InferenceProfileKind, InferenceProfileRecord, LoadableRegistry } from '@two-pebble/realtime';
import { useAppSettings, useInferenceProfiles, useUpdateAppSettings } from '@two-pebble/realtime';

const NONE_VALUE = '__none__';

export function VoiceSettingsPage() {
  const appSettings = useAppSettings();
  const inferenceProfiles = useInferenceProfiles();
  const updateAppSettings = useUpdateAppSettings();

  const transcriptionOptions = buildProfileOptions(inferenceProfiles, 'transcription');
  const speechOptions = buildProfileOptions(inferenceProfiles, 'speech');
  const settings = appSettings.value;
  const transcriptionProfileId = settings?.defaultTranscriptionProfileId ?? NONE_VALUE;
  const speechProfileId = settings?.defaultSpeechProfileId ?? NONE_VALUE;

  const onTranscriptionChange = (value: string) => {
    if (settings === null) {
      return;
    }
    void updateAppSettings({
      defaultKnownIdeId: settings.defaultKnownIdeId,
      defaultTranscriptionProfileId: value === NONE_VALUE ? null : value,
      defaultSpeechProfileId: settings.defaultSpeechProfileId,
      assistantAgentRegistryId: settings.assistantAgentRegistryId,
      assistantAgentId: settings.assistantAgentId,
      assistantCommandKEnabled: settings.assistantCommandKEnabled,
      assistantCommandKVoiceModeEnabled: settings.assistantCommandKVoiceModeEnabled,
    });
  };

  const onSpeechChange = (value: string) => {
    if (settings === null) {
      return;
    }
    void updateAppSettings({
      defaultKnownIdeId: settings.defaultKnownIdeId,
      defaultTranscriptionProfileId: settings.defaultTranscriptionProfileId,
      defaultSpeechProfileId: value === NONE_VALUE ? null : value,
      assistantAgentRegistryId: settings.assistantAgentRegistryId,
      assistantAgentId: settings.assistantAgentId,
      assistantCommandKEnabled: settings.assistantCommandKEnabled,
      assistantCommandKVoiceModeEnabled: settings.assistantCommandKVoiceModeEnabled,
    });
  };

  return (
    <PageLayout width="fixed">
      <Header subtitle="Pick which inference profiles drive speech-to-text and text-to-speech for the assistant and voice capture surfaces.">
        Voice
      </Header>
      <Section subtitle="Defaults used by voice capture and audio output throughout the app." title="Defaults">
        <Surface>
          <Select
            fullWidth
            label="Default transcription profile"
            onChange={onTranscriptionChange}
            options={transcriptionOptions}
            placeholder={
              transcriptionOptions.length <= 1 ? 'Create a transcription inference profile first' : 'Select profile'
            }
            value={transcriptionProfileId}
          />
          <Select
            fullWidth
            label="Default speech profile"
            onChange={onSpeechChange}
            options={speechOptions}
            placeholder={speechOptions.length <= 1 ? 'Create a speech inference profile first' : 'Select profile'}
            value={speechProfileId}
          />
        </Surface>
      </Section>
    </PageLayout>
  );
}

function buildProfileOptions(
  inferenceProfiles: LoadableRegistry<InferenceProfileRecord>,
  kind: InferenceProfileKind,
): SelectOption[] {
  const matching = inferenceProfiles
    .values()
    .filter((profile) => profile.kind === kind)
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((profile) => ({
      icon: <ProviderLogo provider={profile.provider} size="xs" />,
      label: profile.name.length > 0 ? profile.name : `Untitled ${profile.provider} profile`,
      value: profile.id,
    }));
  return [{ label: 'None', value: NONE_VALUE }, ...matching];
}
