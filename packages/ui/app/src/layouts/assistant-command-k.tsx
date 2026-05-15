'use client';

import { useToast } from '@two-pebble/components';
import { useAppSettings, useLaunchAgent, useSendAgentMessage, useUpdateAppSettings } from '@two-pebble/realtime';
import { useCallback, useEffect, useRef, useState } from 'react';
import { VoiceCaptureButton } from '../shared/voice/voice-capture-button';

/**
 * Global Command-K assistant speech overlay.
 *
 * Activated by pressing Cmd+K (or Ctrl+K on Windows/Linux) anywhere in the
 * app when `appSettings.assistantCommandKEnabled` is true. A small centered
 * overlay appears immediately, the mic auto-starts, and on transcript
 * submission the message is dispatched to the persisted Assistant agent. A
 * toast confirms the send; the user stays on the current page.
 *
 * The overlay closes on Escape, on backdrop click, or after a transcript is
 * submitted. While open, the rest of the UI has a soft backdrop blur and
 * dim overlay so the assistant input stands out without being a full
 * blocking modal.
 *
 * Focus management: the overlay container receives focus on open so keyboard
 * events are captured; Escape handling is attached to the window so it
 * works even if the VoiceCaptureButton internals hold focus.
 */
export function AssistantCommandK() {
  const appSettings = useAppSettings();
  const updateAppSettings = useUpdateAppSettings();
  const launchAgent = useLaunchAgent();
  const sendAgentMessage = useSendAgentMessage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const settings = appSettings.value;
  const enabled = settings?.assistantCommandKEnabled ?? false;

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  // Global keydown: open on Cmd/Ctrl+K when enabled. Escape is handled on
  // the dialog element so it works regardless of which child holds focus.
  useEffect(() => {
    if (!enabled) {
      // If the setting is disabled while the overlay is open, close it.
      setOpen(false);
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);

  // Move focus into the overlay container when it opens so the dialog
  // traps keyboard navigation and Escape events propagate correctly.
  useEffect(() => {
    if (!open) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      containerRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  if (!open || settings === null) {
    return null;
  }

  const registryId = settings.assistantAgentRegistryId;
  const agentId = settings.assistantAgentId;

  const sendToAssistant = async (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return;
    }
    close();
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
          assistantCommandKEnabled: settings.assistantCommandKEnabled,
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
    <>
      {/* Backdrop: soft blur + dim overlay. Not a full modal — the user can
          still see the app context behind it. Click anywhere on the backdrop
          to dismiss. */}
      <div aria-hidden="true" className="fixed inset-0 z-[900] bg-black/40 backdrop-blur-sm" onClick={close} />

      {/* Overlay panel: small, centered, sits above the backdrop. */}
      <div
        ref={containerRef}
        aria-label="Assistant voice input"
        aria-modal="true"
        className="fixed left-1/2 top-[30%] z-[901] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface-raised px-6 py-5 shadow-modal focus:outline-none"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            close();
          }
        }}
        role="dialog"
        tabIndex={-1}
      >
        <p className="mb-4 text-center text-sm font-medium text-content-muted">Speak your Assistant command</p>
        <div className="flex justify-center">
          <VoiceCaptureButton
            buttonSize="md"
            buttonVariant="primary"
            onSubmitTranscript={(text) => void sendToAssistant(text)}
            onTranscript={(text) => void sendToAssistant(text)}
            submitOnly
          />
        </div>
        <p className="mt-4 text-center text-xs text-content-muted">Press Esc to cancel</p>
      </div>
    </>
  );
}
