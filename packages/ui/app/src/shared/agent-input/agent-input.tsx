'use client';

import {
  type RichComposerBoard,
  type RichComposerDocument,
  type RichComposerSubmitPayload,
  RichMessageComposer,
  type RichMessageComposerVoiceHandlers,
} from '@two-pebble/components';
import { useDocuments, useTaskBoards } from '@two-pebble/realtime';
import { useMemo } from 'react';
import { VoiceCaptureButton } from '../voice/voice-capture-button';

export type { RichComposerSubmitPayload } from '@two-pebble/components';

export interface AgentInputProps {
  onSubmit: (payload: RichComposerSubmitPayload) => void;
  disabled?: boolean;
  submitDisabled?: boolean;
  placeholder?: string;
  ariaLabel?: string;
  initialMode?: 'text' | 'voice';
  /** Per-surface storage key so rich mentions survive navigation. */
  draftStorageKey?: string;
  /** When false, the voice capture toggle is hidden — used by prompt editors. */
  enableVoice?: boolean;
  minHeight?: number;
}

/**
 * Application-side host for `RichMessageComposer`.
 *
 * Pulls reference lists from the realtime store and wires the voice
 * capture button so the component-library composer can stay free of
 * app-level dependencies (realtime, voice).
 */
export function AgentInput(props: AgentInputProps) {
  const documents = useDocuments();
  const taskBoards = useTaskBoards();
  const documentItems = useMemo<RichComposerDocument[]>(() => {
    const value = documents.value;
    if (value === null) {
      return [];
    }
    const rows: RichComposerDocument[] = [];
    for (const entry of value.values()) {
      if (entry.value !== null) {
        rows.push({ id: entry.value.id, name: entry.value.name });
      }
    }
    rows.sort((a, b) => a.name.localeCompare(b.name));
    return rows;
  }, [documents.value]);
  const boardItems = useMemo<RichComposerBoard[]>(() => {
    const value = taskBoards.value;
    if (value === null) {
      return [];
    }
    const rows: RichComposerBoard[] = [];
    for (const entry of value.values()) {
      if (entry.value !== null) {
        rows.push({ id: entry.value.id, name: entry.value.name });
      }
    }
    rows.sort((a, b) => a.name.localeCompare(b.name));
    return rows;
  }, [taskBoards.value]);

  const renderVoiceCapture =
    props.enableVoice === false
      ? undefined
      : (handlers: RichMessageComposerVoiceHandlers) => (
          <VoiceCaptureButton
            autoStart
            buttonSize="md"
            buttonVariant="primary"
            onStatusChange={handlers.onStatusChange}
            onSubmitTranscript={handlers.onSubmitTranscript}
            onTranscript={handlers.onTranscript}
          />
        );

  return (
    <RichMessageComposer
      ariaLabel={props.ariaLabel}
      boards={boardItems}
      disabled={props.disabled}
      documents={documentItems}
      draftStorageKey={props.draftStorageKey}
      initialMode={props.initialMode}
      minHeight={props.minHeight}
      onSubmit={props.onSubmit}
      placeholder={props.placeholder}
      renderVoiceCapture={renderVoiceCapture}
      submitDisabled={props.submitDisabled}
    />
  );
}
