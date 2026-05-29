import { Checkbox, Header, PageLayout, Section, Surface } from '@two-pebble/components';
import { useAppSettings, useUpdateAppSettings } from '@two-pebble/realtime';

export function AssistantSettingsPage() {
  const appSettings = useAppSettings();
  const updateAppSettings = useUpdateAppSettings();

  const settings = appSettings.value;
  const assistantCommandKVoiceModeEnabled = settings?.assistantCommandKVoiceModeEnabled ?? false;
  const chatConversationFoldingEnabled = settings?.chatConversationFoldingEnabled ?? false;

  const onAssistantCommandKVoiceModeChange = (next: boolean) => {
    if (settings === null) {
      return;
    }
    void updateAppSettings({
      defaultKnownIdeId: settings.defaultKnownIdeId,
      defaultTranscriptionProfileId: settings.defaultTranscriptionProfileId,
      defaultSpeechProfileId: settings.defaultSpeechProfileId,
      assistantAgentRegistryId: settings.assistantAgentRegistryId,
      assistantAgentId: settings.assistantAgentId,
      assistantCommandKVoiceModeEnabled: next,
      chatConversationFoldingEnabled: settings.chatConversationFoldingEnabled,
    });
  };

  const onChatConversationFoldingChange = (next: boolean) => {
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
      chatConversationFoldingEnabled: next,
    });
  };

  return (
    <PageLayout width="fixed">
      <Header subtitle="Configure Assistant behavior. The agent that backs the Assistant is set per project in Project settings.">
        Assistant
      </Header>
      <Section
        subtitle="The Assistant overlay always opens with Cmd+K (or Ctrl+K) from anywhere."
        title="Keyboard shortcut"
      >
        <Surface>
          <Checkbox
            checked={assistantCommandKVoiceModeEnabled}
            label="Start in voice mode (auto-records when opened)"
            onChange={(event) => onAssistantCommandKVoiceModeChange(event.target.checked)}
          />
        </Surface>
      </Section>
      <Section
        subtitle="Default each user/assistant exchange in chat mode to a folded layout — tool calls and intermediate model traffic collapse behind a click-to-expand control."
        title="Chat view"
      >
        <Surface>
          <Checkbox
            checked={chatConversationFoldingEnabled}
            label="Fold tool and model traffic by default"
            onChange={(event) => onChatConversationFoldingChange(event.target.checked)}
          />
        </Surface>
      </Section>
    </PageLayout>
  );
}
