'use client';

import { useToast } from '@two-pebble/components';
import { useAppSettings, useSendAssistantMessage } from '@two-pebble/realtime';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AgentInput, type RichComposerSubmitPayload } from '../shared/agent-input/agent-input';

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
  const sendAssistantMessage = useSendAssistantMessage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const settings = appSettings.value;
  const enabled = settings?.assistantCommandKEnabled ?? false;
  const startInVoiceMode = settings?.assistantCommandKVoiceModeEnabled ?? false;

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

  if (!enabled || !open) {
    return null;
  }

  const registryId = settings?.assistantAgentRegistryId ?? null;

  const sendToAssistant = async (payload: RichComposerSubmitPayload) => {
    const trimmed = payload.markdown.trim();
    if (trimmed.length === 0 && payload.cells.length === 0) {
      return;
    }
    close();
    if (registryId === null) {
      toast('Pick an Assistant agent in Settings before sending.', 'error');
      return;
    }
    try {
      const result = await sendAssistantMessage({ message: trimmed, cells: payload.cells });
      toast(result.launched ? 'Started Assistant and sent message.' : 'Sent to Assistant.', 'success');
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
          onSubmit={(payload) => void sendToAssistant(payload)}
          placeholder="Type or speak — Enter to send, / for documents"
          submitDisabled={registryId === null}
        />
      </div>
    </>
  );
}
