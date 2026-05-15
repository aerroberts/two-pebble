import { Checkbox, Header, PageLayout, Section, Select, type SelectOption, Surface } from '@two-pebble/components';
import { useAgentRegistries, useAppSettings, useUpdateAppSettings } from '@two-pebble/realtime';

const NONE_VALUE = '__none__';

export function AssistantSettingsPage() {
  const appSettings = useAppSettings();
  const agentRegistries = useAgentRegistries();
  const updateAppSettings = useUpdateAppSettings();

  const assistantAgentOptions = buildAgentRegistryOptions(agentRegistries);
  const settings = appSettings.value;
  const assistantAgentRegistryId = settings?.assistantAgentRegistryId ?? NONE_VALUE;
  const assistantFabEnabled = settings?.assistantFabEnabled ?? false;

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
      assistantFabEnabled: settings.assistantFabEnabled,
    });
  };

  const onAssistantFabChange = (next: boolean) => {
    if (settings === null) {
      return;
    }
    void updateAppSettings({
      defaultTranscriptionProfileId: settings.defaultTranscriptionProfileId,
      defaultSpeechProfileId: settings.defaultSpeechProfileId,
      assistantAgentRegistryId: settings.assistantAgentRegistryId,
      assistantAgentId: settings.assistantAgentId,
      assistantFabEnabled: next,
    });
  };

  return (
    <PageLayout width="fixed">
      <Header>Assistant</Header>
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
      <Section
        subtitle="Show a floating mic button in the main app shell so the Assistant is reachable from any page."
        title="Quick access"
      >
        <Surface>
          <Checkbox
            checked={assistantFabEnabled}
            label="Show floating Assistant button"
            onChange={(event) => onAssistantFabChange(event.target.checked)}
          />
        </Surface>
      </Section>
    </PageLayout>
  );
}

type AgentRegistryLike = { id: string; name: string };
interface AgentRegistryOptionsInput {
  values(): AgentRegistryLike[];
}

function buildAgentRegistryOptions(registries: AgentRegistryOptionsInput): SelectOption[] {
  const matching = registries
    .values()
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((registry) => ({
      label: registry.name.length > 0 ? registry.name : 'Untitled agent',
      value: registry.id,
    }));
  return [{ label: 'None', value: NONE_VALUE }, ...matching];
}
