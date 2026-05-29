import { Header, PageLayout, Section, Select, type SelectOption, Surface } from '@two-pebble/components';
import {
  type AgentRegistryRecord,
  type InferenceProfileRecord,
  type LoadableRegistry,
  type ThirdPartyAgentInstallRecord,
  useAgentRegistries,
  useAppSettings,
  useInferenceProfiles,
  useProjects,
  useThirdPartyAgentInstalls,
  useUpdateAppSettings,
} from '@two-pebble/realtime';
import { agentRegistryIcon } from '../../../shared/agents/agent-registry-icon';

const NONE_VALUE = '__none__';

export function DocumentsSettingsPage() {
  const appSettings = useAppSettings();
  const projects = useProjects();
  const projectId = projects.values()[0]?.id ?? '';
  const agentRegistries = useAgentRegistries(projectId.length === 0 ? undefined : { projectId });
  const inferenceProfiles = useInferenceProfiles();
  const installs = useThirdPartyAgentInstalls();
  const updateAppSettings = useUpdateAppSettings();

  const agentOptions = buildAgentRegistryOptions(agentRegistries, inferenceProfiles, installs);
  const settings = appSettings.value;
  const documentRunnerAgentRegistryId = settings?.documentRunnerAgentRegistryId ?? NONE_VALUE;

  const onDocumentRunnerChange = (value: string) => {
    if (settings === null) {
      return;
    }
    void updateAppSettings({
      defaultKnownIdeId: settings.defaultKnownIdeId,
      defaultTranscriptionProfileId: settings.defaultTranscriptionProfileId,
      defaultSpeechProfileId: settings.defaultSpeechProfileId,
      assistantAgentRegistryId: settings.assistantAgentRegistryId,
      assistantAgentId: settings.assistantAgentId,
      assistantCommandKVoiceModeEnabled: settings.assistantCommandKVoiceModeEnabled,
      chatConversationFoldingEnabled: settings.chatConversationFoldingEnabled,
      documentRunnerAgentRegistryId: value === NONE_VALUE ? null : value,
    });
  };

  return (
    <PageLayout width="fixed">
      <Header subtitle="Configure how documents run agents.">Documents</Header>
      <Section
        subtitle="Agent launched by the 'Send to Agent' button on documents. The agent receives a single message containing the document as a reference pill."
        title="Document runner"
      >
        <Surface>
          <Select
            fullWidth
            label="Document runner agent"
            onChange={onDocumentRunnerChange}
            options={agentOptions}
            placeholder={agentOptions.length <= 1 ? 'Create an agent in the agent registry first' : 'Select agent'}
            value={documentRunnerAgentRegistryId}
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
