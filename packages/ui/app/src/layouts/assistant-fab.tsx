'use client';

import { useToast } from '@two-pebble/components';
import { useAppSettings, useLaunchAgent, useSendAgentMessage, useUpdateAppSettings } from '@two-pebble/realtime';
import { VoiceCaptureButton } from '../shared/voice/voice-capture-button';

/**
 * Global Assistant mic FAB.
 *
 * Pinned to the bottom-right corner of every page in the main app shell.
 * Toggled by `appSettings.assistantFabEnabled` (managed on the Assistant
 * settings page). Tap the mic, speak, send — the transcript is dispatched
 * to the persisted Assistant agent (launched against
 * `assistantAgentRegistryId` on first use). The current page stays put;
 * a toast acknowledges the send so the user knows the Assistant heard
 * them without losing their place.
 *
 * The button reuses the standard `VoiceCaptureButton` so its visual size
 * matches every other voice mic in the app. Dismissal is via the settings
 * page rather than an inline X — keeps the chrome down to a single
 * affordance.
 */
export function AssistantFab() {
  const appSettings = useAppSettings();
  const updateAppSettings = useUpdateAppSettings();
  const launchAgent = useLaunchAgent();
  const sendAgentMessage = useSendAgentMessage();
  const { toast } = useToast();

  const settings = appSettings.value;
  if (settings === null || !settings.assistantFabEnabled) {
    return null;
  }

  const registryId = settings.assistantAgentRegistryId;
  const agentId = settings.assistantAgentId;

  const sendToAssistant = async (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return;
    }
    if (registryId === null) {
      toast('Pick an Assistant agent in Settings before sending.', 'error');
      return;
    }
    try {
      if (agentId === null) {
        const launched = await launchAgent({ agentRegistryId: registryId, message: trimmed });
        await updateAppSettings({
          defaultTranscriptionProfileId: settings.defaultTranscriptionProfileId,
          defaultSpeechProfileId: settings.defaultSpeechProfileId,
          assistantAgentRegistryId: settings.assistantAgentRegistryId,
          assistantAgentId: launched.id,
          assistantFabEnabled: settings.assistantFabEnabled,
        });
      } else {
        await sendAgentMessage({ agentId, message: trimmed });
      }
      toast('Sent to Assistant.', 'success');
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : 'Failed to send.';
      toast(message, 'error');
    }
  };

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <VoiceCaptureButton
        onSubmitTranscript={(text) => void sendToAssistant(text)}
        onTranscript={(text) => void sendToAssistant(text)}
        submitOnly
      />
    </div>
  );
}
