import { Checkbox, Header, PageLayout, Section, Select, type SelectOption, Surface } from '@two-pebble/components';
import {
  type AgentRegistryRecord,
  type InferenceProfileRecord,
  type LoadableRegistry,
  type ThirdPartyAgentInstallRecord,
  useAgentRegistries,
  useAppSettings,
  useInferenceProfiles,
  useThirdPartyAgentInstalls,
  useUpdateAppSettings,
} from '@two-pebble/realtime';
import { agentRegistryIcon } from '../../../shared/agents/agent-registry-icon';

const NONE_VALUE = '__none__';

export function AssistantSettingsPage() {
  const appSettings = useAppSettings();
  const agentRegistries = useAgentRegistries();
  const inferenceProfiles = useInferenceProfiles();
  const installs = useThirdPartyAgentInstalls();
  const updateAppSettings = useUpdateAppSettings();

  const assistantAgentOptions = buildAgentRegistryOptions(agentRegistries, inferenceProfiles, installs);
  const settings = appSettings.value;
  const assistantAgentRegistryId = settings?.assistantAgentRegistryId ?? NONE_VALUE;
  const assistantCommandKEnabled = settings?.assistantCommandKEnabled ?? false;
  const assistantCommandKVoiceModeEnabled = settings?.assistantCommandKVoiceModeEnabled ?? false;

  const onAssistantAgentChange = (value: string) => {
    if (settings === null) {
      return;
    }
    const nextRegistryId = value === NONE_VALUE ? null : value;
    const registryChanged = nextRegistryId !== settings.assistantAgentRegistryId;
    void updateAppSettings({
      defaultTranscriptionProfileId: settings.defaultTranscriptionProfileId,
      defaultSpeechProfileId: settings.defaultSpeechProfileId,
      assistantAgentRegistryId: nextRegistryId,
      assistantAgentId: registryChanged ? null : settings.assistantAgentId,
      assistantCommandKEnabled: settings.assistantCommandKEnabled,
      assistantCommandKVoiceModeEnabled: settings.assistantCommandKVoiceModeEnabled,
    });
  };

  const onAssistantCommandKChange = (next: boolean) => {
    if (settings === null) {
      return;
    }
    void updateAppSettings({
      defaultTranscriptionProfileId: settings.defaultTranscriptionProfileId,
      defaultSpeechProfileId: settings.defaultSpeechProfileId,
      assistantAgentRegistryId: settings.assistantAgentRegistryId,
      assistantAgentId: settings.assistantAgentId,
      assistantCommandKEnabled: next,
      assistantCommandKVoiceModeEnabled: settings.assistantCommandKVoiceModeEnabled,
    });
  };

  const onAssistantCommandKVoiceModeChange = (next: boolean) => {
    if (settings === null) {
      return;
    }
    void updateAppSettings({
      defaultTranscriptionProfileId: settings.defaultTranscriptionProfileId,
      defaultSpeechProfileId: settings.defaultSpeechProfileId,
      assistantAgentRegistryId: settings.assistantAgentRegistryId,
      assistantAgentId: settings.assistantAgentId,
      assistantCommandKEnabled: settings.assistantCommandKEnabled,
      assistantCommandKVoiceModeEnabled: next,
    });
  };

  return (
    <PageLayout width="fixed">
      <Header subtitle="Configure which agent backs the Assistant page and whether the floating launcher (FAB) is enabled.">
        Assistant
      </Header>
      <Section subtitle="Agent registry that powers the Assistant page." title="Agent">
        <Surface>
          <Select
            fullWidth
            label="Assistant agent"
            onChange={onAssistantAgentChange}
            options={assistantAgentOptions}
            placeholder={
              assistantAgentOptions.length <= 1 ? 'Create an agent in the agent registry first' : 'Select agent'
            }
            value={assistantAgentRegistryId}
          />
        </Surface>
      </Section>
      <Section subtitle="Open the Assistant overlay with Cmd+K (or Ctrl+K) from anywhere." title="Keyboard shortcut">
        <Surface>
          <Checkbox
            checked={assistantCommandKEnabled}
            label="Enable Cmd+K assistant shortcut"
            onChange={(event) => onAssistantCommandKChange(event.target.checked)}
          />
          <Checkbox
            checked={assistantCommandKVoiceModeEnabled}
            disabled={!assistantCommandKEnabled}
            label="Start in voice mode (auto-records when opened)"
            onChange={(event) => onAssistantCommandKVoiceModeChange(event.target.checked)}
          />
        </Surface>
      </Section>
    </PageLayout>
  );
}

function buildAgentRegistryOptions(
  registries: LoadableRegistry<AgentRegistryRecord>,
  profiles: LoadableRegistry<InferenceProfileRecord>,
  installs: LoadableRegistry<ThirdPartyAgentInstallRecord>,
): SelectOption[] {
  const matching = registries
    .values()
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((registry) => ({
      icon: agentRegistryIcon(registry, profiles, installs),
      label: registry.name.length > 0 ? registry.name : 'Untitled agent',
      value: registry.id,
    }));
  return [{ label: 'None', value: NONE_VALUE }, ...matching];
}
