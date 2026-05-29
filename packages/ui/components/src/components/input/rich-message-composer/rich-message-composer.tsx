'use client';

import type { Editor, JSONContent } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { type CSSProperties, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { IconButton } from '../icon-button/icon-button';
import { BoardMentionNode } from './board-mention-node';
// `mode` tracks whether the user is currently in voice flow so the auto-flip
// back to text after a transcript is processed still works; both modes share
// the same visible editor surface so we never tear down the input.
import {
  clearComposerDraft,
  emptyComposerDoc,
  isComposerDocEmpty,
  loadComposerDraft,
  saveComposerDraft,
} from './composer-doc';
import type {
  RichComposerBoard,
  RichComposerDocument,
  RichComposerMemory,
  RichComposerReference,
  RichComposerSlashTrigger,
  RichComposerSubmitPayload,
  RichComposerTask,
} from './composer-types';
import { DocumentMentionNode } from './document-mention-node';
import { MemoryMentionNode } from './memory-mention-node';
import { SlashReferencePopover } from './slash-document-popover';
import { insertTranscriptAtCursor, readActiveSlashTrigger, replaceTriggerWithReferenceMention } from './slash-trigger';
import { TaskMentionNode } from './task-mention-node';
import { tipTapDocToCells } from './tiptap-doc-to-cells';
import { tipTapDocToMarkdown } from './tiptap-doc-to-markdown';

export interface RichMessageComposerVoiceHandlers {
  onTranscript: (text: string) => void;
  onSubmitTranscript: (text: string) => void;
  onStatusChange: (status: 'idle' | 'recording' | 'transcribing' | 'error') => void;
  /**
   * True when the consumer's caller asked the composer to open straight into
   * voice mode (`initialMode='voice'`). The voice slot can wire this through
   * to whatever auto-start affordance it provides.
   */
  autoStart: boolean;
}

export interface RichMessageComposerProps {
  onSubmit: (payload: RichComposerSubmitPayload) => void;
  /** Documents available to the `/doc` slash command. */
  documents: ReadonlyArray<RichComposerDocument>;
  /** Task boards available to the slash command. */
  boards?: ReadonlyArray<RichComposerBoard>;
  /** Tasks available to the slash command. */
  tasks?: ReadonlyArray<RichComposerTask>;
  /** Memory collections available to the slash command. */
  memories?: ReadonlyArray<RichComposerMemory>;
  /** Called whenever the underlying document changes. */
  onChange?: (doc: JSONContent) => void;
  disabled?: boolean;
  submitDisabled?: boolean;
  placeholder?: string;
  ariaLabel?: string;
  /** Open straight into voice mode and auto-start recording. */
  initialMode?: 'text' | 'voice';
  /**
   * Per-surface storage key. When set, the composer mirrors its TipTap
   * JSON to localStorage so rich nodes survive navigation.
   */
  draftStorageKey?: string;
  /**
   * Optional voice-capture slot. The composer manages text/voice mode and
   * hands the renderer transcript + status callbacks; voice capture
   * implementation stays in app code so component-library deps stay
   * provider-agnostic.
   */
  renderVoiceCapture?: (handlers: RichMessageComposerVoiceHandlers) => ReactNode;
  /** Minimum height of the editing area. */
  minHeight?: number;
  /**
   * Maximum height of the editing area. When set, longer content
   * scrolls inside the editor instead of expanding past the surrounding
   * container. Without it the editor grows unboundedly with content.
   */
  maxHeight?: number;
}

/**
 * TipTap-based rich-text composer with structured cell output.
 *
 * Emits both markdown (for legacy logging and voice flows) and a
 * structured `cells` array on submit. Typing `/` opens an inline popover
 * filtered against the supplied documents and boards — selecting an item
 * inserts a mention pill carrying its durable id and name. The
 * picker is anchored to the cursor, not a fullscreen modal, so the
 * trigger feels like a true slash command.
 */
export function RichMessageComposer(props: RichMessageComposerProps) {
  const initialMode = props.initialMode ?? 'text';
  const [mode, setMode] = useState<'text' | 'voice'>(initialMode);
  const [slashTrigger, setSlashTrigger] = useState<RichComposerSlashTrigger | null>(null);
  const hasRecordedRef = useRef(false);
  const editorRef = useRef<Editor | null>(null);
  const onChangeRef = useRef(props.onChange);
  onChangeRef.current = props.onChange;
  const submitFromEditorRef = useRef<() => void>(() => undefined);
  const slashTriggerRef = useRef<RichComposerSlashTrigger | null>(null);
  slashTriggerRef.current = slashTrigger;
  const minHeight = props.minHeight ?? 80;
  // Default to a sensible scroll cap so the composer stays in place once the
  // user has typed enough to fill the surrounding chat / panel. Without this
  // an unbounded editor pushes its surrounding container — and any send
  // buttons — off-screen on long messages. Callers (e.g. Cmd+K overlay) can
  // still pin a tighter cap.
  const maxHeight = props.maxHeight ?? 320;
  const draftStorageKey = props.draftStorageKey;
  const voiceSlotEnabled = props.renderVoiceCapture !== undefined;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: props.placeholder ?? 'Type a message — / for commands, Enter to send' }),
      BoardMentionNode,
      DocumentMentionNode,
      MemoryMentionNode,
      TaskMentionNode,
    ],
    content: loadInitialDoc(draftStorageKey),
    editorProps: {
      attributes: {
        'aria-label': props.ariaLabel ?? 'Rich message composer',
        class: 'composer-content',
      },
      handleKeyDown: (_view, event) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && slashTriggerRef.current === null) {
          event.preventDefault();
          submitFromEditorRef.current();
          return true;
        }
        return false;
      },
    },
    onUpdate: (event) => {
      const currentEditor = event.editor;
      const doc = currentEditor.getJSON();
      const trigger = readActiveSlashTrigger(currentEditor);
      setSlashTrigger(trigger);
      onChangeRef.current?.(doc);
      if (draftStorageKey !== undefined) {
        saveComposerDraft(draftStorageKey, doc);
      }
    },
    onSelectionUpdate: (event) => {
      setSlashTrigger(readActiveSlashTrigger(event.editor));
    },
  });

  editorRef.current = editor;

  const submitDisabled = (props.submitDisabled ?? false) || editor === null || isComposerDocEmpty(editor.getJSON());

  const submitFromEditor = useCallback(() => {
    const current = editorRef.current;
    if (current === null) {
      return;
    }
    const doc = current.getJSON();
    if (isComposerDocEmpty(doc) || props.submitDisabled === true || props.disabled === true) {
      return;
    }
    const cells = tipTapDocToCells(doc);
    if (cells.length === 0) {
      return;
    }
    const markdown = tipTapDocToMarkdown(doc);
    props.onSubmit({ markdown, cells, doc });
    current.commands.setContent(emptyComposerDoc());
    setSlashTrigger(null);
    if (draftStorageKey !== undefined) {
      clearComposerDraft(draftStorageKey);
    }
  }, [draftStorageKey, props]);

  submitFromEditorRef.current = submitFromEditor;

  const handleReferenceSelected = useCallback((selection: RichComposerReference) => {
    const current = editorRef.current;
    const trigger = slashTriggerRef.current;
    if (current === null || trigger === null) {
      setSlashTrigger(null);
      return;
    }
    replaceTriggerWithReferenceMention(current, trigger, selection);
    setSlashTrigger(null);
  }, []);

  const handleSlashCancel = useCallback(() => {
    setSlashTrigger(null);
  }, []);

  const handleVoiceStatus = useCallback(
    (status: 'idle' | 'recording' | 'transcribing' | 'error') => {
      if (status === 'recording' || status === 'transcribing') {
        hasRecordedRef.current = true;
        return;
      }
      if (status === 'idle' && hasRecordedRef.current && mode === 'voice') {
        hasRecordedRef.current = false;
        setMode('text');
      }
    },
    [mode],
  );

  const handleTranscript = useCallback((text: string) => {
    if (editorRef.current !== null) {
      insertTranscriptAtCursor(editorRef.current, text);
    }
  }, []);

  const handleSubmitTranscript = useCallback((text: string) => {
    if (editorRef.current !== null) {
      insertTranscriptAtCursor(editorRef.current, text);
    }
    submitFromEditorRef.current();
  }, []);

  useEffect(() => {
    if (mode === 'text' && editor !== null) {
      const frame = requestAnimationFrame(() => editor.commands.focus());
      return () => cancelAnimationFrame(frame);
    }
    return undefined;
  }, [mode, editor]);

  useEffect(() => {
    if (editor === null) {
      return;
    }
    editor.setEditable(!(props.disabled ?? false));
  }, [editor, props.disabled]);

  const showVoice = mode === 'voice' && voiceSlotEnabled;
  const popoverOpen = slashTrigger !== null && !showVoice;

  const outerStyle: CSSProperties = { minHeight: minHeight + 16, maxHeight: maxHeight + 16 };
  const editorStyle: CSSProperties = { minHeight, maxHeight, overflowY: 'auto' };

  // Render the voice slot inline where the mic affordance lives. The slot's
  // component is responsible for swapping its own visual between an idle mic
  // button and an active recording waveform pill — so the editor stays
  // visible the entire time and only the corner control changes shape.
  const voiceSlot =
    voiceSlotEnabled && props.renderVoiceCapture !== undefined
      ? props.renderVoiceCapture({
          autoStart: initialMode === 'voice',
          onStatusChange: handleVoiceStatus,
          onSubmitTranscript: handleSubmitTranscript,
          onTranscript: handleTranscript,
        })
      : null;

  return (
    <div className="relative w-full min-w-0" style={outerStyle}>
      <div className="relative flex h-full min-w-0 rounded-md border border-border bg-surface transition-[border-color] duration-200 focus-within:border-accent">
        <EditorContent editor={editor} className="composer-editor h-full w-full min-w-0" style={editorStyle} />
        {voiceSlot !== null ? <div className="absolute right-1.5 top-1.5 flex items-center">{voiceSlot}</div> : null}
        {submitDisabled ? null : (
          <div className="absolute right-1.5 bottom-1.5">
            <IconButton
              aria-label="Send message"
              disabled={props.disabled}
              icon="send"
              onClick={submitFromEditor}
              size="sm"
              variant="primary"
            />
          </div>
        )}
      </div>

      <SlashReferencePopover
        anchorLeft={slashTrigger?.anchorLeft ?? 0}
        anchorTop={slashTrigger?.anchorTop ?? 0}
        boards={props.boards ?? []}
        documents={props.documents}
        tasks={props.tasks ?? []}
        memories={props.memories ?? []}
        onCancel={handleSlashCancel}
        onSelect={handleReferenceSelected}
        open={popoverOpen}
        query={slashTrigger?.query ?? ''}
      />
    </div>
  );
}

function loadInitialDoc(storageKey: string | undefined): JSONContent {
  if (storageKey === undefined) {
    return emptyComposerDoc();
  }
  return loadComposerDraft(storageKey) ?? emptyComposerDoc();
}
