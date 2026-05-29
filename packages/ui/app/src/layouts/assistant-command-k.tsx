'use client';

import { MinimalSelect, type SelectOption, useToast } from '@two-pebble/components';
import {
  useAgentRegistries,
  useAppSettings,
  useInferenceProfiles,
  useLaunchAgent,
  useProjects,
  useSendAssistantMessage,
  useThirdPartyAgentInstalls,
} from '@two-pebble/realtime';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { projectPath } from '../project-context';
import { AgentInput, type RichComposerSubmitPayload } from '../shared/agent-input/agent-input';
import { agentRegistryIcon } from '../shared/agents/agent-registry-icon';

/**
 * Global Command-K assistant overlay.
 *
 * Activated by pressing Cmd+K (or Ctrl+K on Windows/Linux) anywhere in the
 * app when `appSettings.assistantCommandKEnabled` is true. The overlay opens
 * centered with a soft backdrop blur and renders the rich composer.
 * When `assistantCommandKVoiceModeEnabled` is also on, the overlay opens
 * straight into voice mode and starts recording immediately. Submitting
 * dispatches the message to the persisted Assistant agent and dismisses
 * the overlay; the user stays on the current page and a toast confirms.
 */
export function AssistantCommandK() {
  const appSettings = useAppSettings();
  const projects = useProjects();
  const location = useLocation();
  const sendAssistantMessage = useSendAssistantMessage();
  const launchAgent = useLaunchAgent();
  const projectId = readProjectIdFromPath(location.pathname);
  const project = projectId === null ? null : (projects.getItem(projectId)?.value ?? null);
  const agentRegistries = useAgentRegistries(projectId === null ? undefined : { projectId });
  const inferenceProfiles = useInferenceProfiles();
  const installs = useThirdPartyAgentInstalls();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const settings = appSettings.value;
  const enabled = settings?.assistantCommandKEnabled ?? false;
  const startInVoiceMode = settings?.assistantCommandKVoiceModeEnabled ?? false;
  const assistantRegistryId = project?.assistantAgentRegistryId ?? null;

  const agentRegistryOptions = useMemo<SelectOption[]>(() => {
    const sorted = agentRegistries.values().sort((left, right) => left.name.localeCompare(right.name));
    return sorted.map((registry) => ({
      icon: agentRegistryIcon(registry, inferenceProfiles, installs),
      label:
        registry.id === assistantRegistryId ? 'Assistant' : registry.name.length > 0 ? registry.name : 'Untitled agent',
      value: registry.id,
    }));
  }, [agentRegistries, assistantRegistryId, inferenceProfiles, installs]);

  const activeAgentId = selectedAgentId ?? assistantRegistryId;

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (event.key === 'Escape' && open) {
        event.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, open, close]);

  useEffect(() => {
    if (open) {
      const frame = requestAnimationFrame(() => {
        containerRef.current?.focus();
      });
      return () => cancelAnimationFrame(frame);
    }
    return undefined;
  }, [open]);

  if (!enabled || !open || projectId === null) {
    return null;
  }

  const sendToAgent = async (payload: RichComposerSubmitPayload) => {
    const trimmed = payload.markdown.trim();
    if (trimmed.length === 0 && payload.cells.length === 0) {
      return;
    }
    close();
    if (activeAgentId === null) {
      toast('Pick an agent before sending.', 'error');
      return;
    }
    try {
      if (activeAgentId === assistantRegistryId) {
        const result = await sendAssistantMessage({ message: trimmed, cells: payload.cells, projectId });
        toast(result.launched ? 'Started Assistant and sent message.' : 'Sent to Assistant.', 'success');
        return;
      }
      const launched = await launchAgent({
        agentRegistryId: activeAgentId,
        message: trimmed,
        cells: payload.cells,
        projectId,
      });
      toast('Launched agent.', 'success');
      navigate(projectPath(projectId, `/agents/${launched.id}`));
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : 'Failed to send.';
      toast(message, 'error');
    }
  };

  return (
    <>
      <div aria-hidden="true" className="fixed inset-0 z-[900] bg-black/40 backdrop-blur-sm" onClick={close} />
      <div
        ref={containerRef}
        aria-label="Assistant input"
        aria-modal="true"
        className="-translate-x-1/2 -translate-y-1/2 fixed top-[30%] left-1/2 z-[901] w-[min(36rem,calc(100%-2rem))] focus:outline-none"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            close();
          }
        }}
        role="dialog"
        tabIndex={-1}
      >
        <AgentInput
          ariaLabel="Assistant message"
          initialMode={startInVoiceMode ? 'voice' : 'text'}
          maxHeight={280}
          minHeight={120}
          onSubmit={(payload) => void sendToAgent(payload)}
          placeholder="Type or speak — Enter to send, / for documents"
          submitDisabled={activeAgentId === null}
        />
        <div className="flex pt-1">
          <MinimalSelect
            ariaLabel="Agent"
            onChange={setSelectedAgentId}
            options={agentRegistryOptions}
            placeholder={agentRegistries.status === 'loading' ? 'Loading agents' : 'Assistant'}
            value={activeAgentId ?? undefined}
            variant="pill"
          />
        </div>
      </div>
    </>
  );
}

function readProjectIdFromPath(pathname: string): string | null {
  const match = /^\/project\/([^/]+)/.exec(pathname);
  return match?.[1] ?? null;
}
