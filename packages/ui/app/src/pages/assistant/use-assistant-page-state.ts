import { useToast } from '@two-pebble/components';
import {
  useAgentLiveness,
  useAgents,
  useAgentTraces,
  useAppSettings,
  useSendAssistantMessage,
} from '@two-pebble/realtime';
import { useMemo, useState } from 'react';

export function useAssistantPageState() {
  const appSettings = useAppSettings();
  const sendAssistantMessage = useSendAssistantMessage();
  const agents = useAgents();
  const toaster = useToast();
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

  const sendChatMessage = async (override?: string) => {
    const source = override ?? chatDraft;
    const trimmed = source.trim();
    if (trimmed.length === 0 || registryId === null) {
      return;
    }
    setChatSending(true);
    setChatError('');
    try {
      const result = await sendAssistantMessage({ message: trimmed });
      if (result.launched && agentId !== null) {
        toaster.toast('Previous Assistant thread had ended; started a new conversation.', 'info');
      }
      setChatDraft('');
    } catch (failure) {
      setChatError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setChatSending(false);
    }
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
    sendChatMessage,
    setChatDraft,
    settingsLoaded,
    traces,
  };
}
