import { useToast } from '@two-pebble/components';
import type { CellContent } from '@two-pebble/pebble';
import {
  useAgentLiveness,
  useAgents,
  useAgentTraces,
  useAppSettings,
  useSendAssistantMessage,
} from '@two-pebble/realtime';
import { useMemo, useState } from 'react';
import { useProject } from '../../project-context';

export interface AssistantChatSubmitInput {
  markdown: string;
  cells: CellContent[];
}

export function useAssistantPageState() {
  const appSettings = useAppSettings();
  const { project, projectId } = useProject();
  const sendAssistantMessage = useSendAssistantMessage();
  const agents = useAgents({ projectId });
  const toaster = useToast();
  const [chatError, setChatError] = useState('');
  const [chatSending, setChatSending] = useState(false);

  const settings = appSettings.value;
  const registryId = project.assistantAgentRegistryId;
  const agentId = project.assistantAgentId;
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

  const sendChatMessage = async (input: AssistantChatSubmitInput) => {
    const markdown = input.markdown.trim();
    if ((markdown.length === 0 && input.cells.length === 0) || registryId === null) {
      return;
    }
    setChatSending(true);
    setChatError('');
    try {
      const result = await sendAssistantMessage({ message: markdown, cells: input.cells, projectId });
      if (result.launched && agentId !== null) {
        toaster.toast('Previous Assistant thread had ended; started a new conversation.', 'info');
      }
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
    chatError,
    chatSending,
    liveness,
    registryId,
    sendChatMessage,
    settingsLoaded,
    traces,
  };
}
