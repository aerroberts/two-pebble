import { useToast } from '@two-pebble/components';
import type { AgentStatus } from '@two-pebble/realtime';
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

const TERMINAL_AGENT_STATUSES: ReadonlySet<AgentStatus> = new Set(['failed', 'offline']);

function isTerminalAgentStatus(status: AgentStatus | undefined): boolean {
  return status !== undefined && TERMINAL_AGENT_STATUSES.has(status);
}

export function useAssistantPageState() {
  const appSettings = useAppSettings();
  const updateAppSettings = useUpdateAppSettings();
  const launchAgent = useLaunchAgent();
  const sendAgentMessage = useSendAgentMessage();
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

  const persistAgentId = (nextAgentId: AssistantAgentId) => {
    if (settings === null) {
      return;
    }
    void updateAppSettings({
      defaultTranscriptionProfileId: settings.defaultTranscriptionProfileId,
      defaultSpeechProfileId: settings.defaultSpeechProfileId,
      assistantAgentRegistryId: settings.assistantAgentRegistryId,
      assistantAgentId: nextAgentId,
      assistantFabEnabled: settings.assistantFabEnabled,
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
      // If the active Assistant agent is in a terminal state (failed/offline),
      // its thread is no longer accepting messages. Spawn a fresh agent so the
      // user can keep talking without a manual reset/refresh.
      const currentAgentStatus = agent?.status;
      const shouldRespawn = agentId !== null && isTerminalAgentStatus(currentAgentStatus);
      if (shouldRespawn) {
        console.warn('Assistant agent is in terminal state; spawning a new agent.', {
          agentId,
          status: currentAgentStatus,
        });
      }
      if (agentId === null || shouldRespawn) {
        const launched = await launchAgent({ agentRegistryId: registryId, message: trimmed });
        persistAgentId(launched.id);
        if (shouldRespawn) {
          toaster.toast('Previous Assistant thread had ended — started a new conversation.', 'info');
        }
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
