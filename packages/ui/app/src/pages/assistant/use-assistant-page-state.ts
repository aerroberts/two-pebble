import {
  useAgentLiveness,
  useAgents,
  useAgentTraces,
  useAppSettings,
  useLaunchAgent,
  useSendAgentMessage,
  useUpdateAppSettings,
} from '@two-pebble/realtime';
import { useMemo, useState } from 'react';

type AssistantAgentId = string | null;

export function useAssistantPageState() {
  const appSettings = useAppSettings();
  const updateAppSettings = useUpdateAppSettings();
  const launchAgent = useLaunchAgent();
  const sendAgentMessage = useSendAgentMessage();
  const agents = useAgents();
  const [chatDraft, setChatDraft] = useState('');
  const [chatError, setChatError] = useState('');
  const [chatSending, setChatSending] = useState(false);

  const settings = appSettings.value;
  const registryId = settings?.assistantAgentRegistryId ?? null;
  const agentId = settings?.assistantAgentId ?? null;
  const agent = agentId === null ? null : (agents.getItem(agentId)?.value ?? null);
  const liveness = useAgentLiveness(agentId ?? '');
  const traces = useAgentTraces({ agentId: agentId ?? '', agentIds: agentId === null ? [] : [agentId] });
  const agentTraces = useMemo(
    () =>
      traces
        .values()
        .filter((trace) => trace.agentId === agentId)
        .sort((left, right) => left.orderId - right.orderId),
    [agentId, traces],
  );

  const settingsLoaded = appSettings.status === 'ready' || settings !== null;

  const persistAgentId = (nextAgentId: AssistantAgentId) => {
    if (settings === null) {
      return;
    }
    void updateAppSettings({
      defaultTranscriptionProfileId: settings.defaultTranscriptionProfileId,
      defaultSpeechProfileId: settings.defaultSpeechProfileId,
      assistantAgentRegistryId: settings.assistantAgentRegistryId,
      assistantAgentId: nextAgentId,
    });
  };

  const sendChatMessage = async (override?: string) => {
    const source = override ?? chatDraft;
    const trimmed = source.trim();
    if (trimmed.length === 0 || registryId === null) {
      return;
    }
    setChatSending(true);
    setChatError('');
    try {
      if (agentId === null) {
        const launched = await launchAgent({ agentRegistryId: registryId, message: trimmed });
        persistAgentId(launched.id);
      } else {
        await sendAgentMessage({ agentId, message: trimmed });
      }
      setChatDraft('');
    } catch (failure) {
      setChatError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setChatSending(false);
    }
  };

  const resetContext = () => {
    setChatError('');
    persistAgentId(null);
  };

  return {
    agent,
    agentId,
    agentTraces,
    chatDraft,
    chatError,
    chatSending,
    liveness,
    registryId,
    resetContext,
    sendChatMessage,
    setChatDraft,
    settingsLoaded,
    traces,
  };
}
