'use client';

import type { Editor, JSONContent } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BoardMentionNode } from './board-mention-node';
import { emptyComposerDoc } from './composer-doc';
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
import { readActiveSlashTrigger, replaceTriggerWithReferenceMention } from './slash-trigger';
import { TaskMentionNode } from './task-mention-node';
import { tipTapDocToCells } from './tiptap-doc-to-cells';
import { tipTapDocToMarkdown } from './tiptap-doc-to-markdown';

export interface RichTextFieldProps {
  /** Initial TipTap JSON document. Pass `undefined` to start empty. */
  initialContent?: JSONContent;
  /** Documents available to the `/doc` slash command. */
  documents: ReadonlyArray<RichComposerDocument>;
  /** Task boards available to the slash command. */
  boards?: ReadonlyArray<RichComposerBoard>;
  /** Tasks available to the slash command. */
  tasks?: ReadonlyArray<RichComposerTask>;
  /** Memory collections available to the slash command. */
  memories?: ReadonlyArray<RichComposerMemory>;
  /** Fires on blur with the current markdown + structured cells. */
  onCommit: (payload: RichComposerSubmitPayload) => void;
  /** Fires on every edit. Use sparingly — every keystroke. */
  onChange?: (doc: JSONContent) => void;
  placeholder?: string;
  ariaLabel?: string;
  label?: string;
  minHeight?: number;
  /**
   * Vertical scroll cap. Once the editor reaches this height the editor area
   * scrolls in place rather than pushing the surrounding form down the page.
   * Mirrors the same prop on `RichMessageComposer`.
   */
  maxHeight?: number;
  disabled?: boolean;
}

/**
 * Plain rich-text edit surface.
 *
 * Shares the composer's slash command and mention nodes
 * with `RichMessageComposer`, but has no submit affordance and treats
 * Enter as a new paragraph. Suited to fields like agent registry
 * system prompts and task descriptions where users edit and commit on
 * blur rather than firing a discrete send action.
 */
export function RichTextField(props: RichTextFieldProps) {
  const [slashTrigger, setSlashTrigger] = useState<RichComposerSlashTrigger | null>(null);
  const slashTriggerRef = useRef<RichComposerSlashTrigger | null>(null);
  slashTriggerRef.current = slashTrigger;
  const editorRef = useRef<Editor | null>(null);
  const onCommitRef = useRef(props.onCommit);
  onCommitRef.current = props.onCommit;
  const onChangeRef = useRef(props.onChange);
  onChangeRef.current = props.onChange;
  const minHeight = props.minHeight ?? 96;
  // Default to a sensible scroll cap so long content stays in place. Callers
  // can pin a different cap, but unbounded growth pushed forms (e.g. agent
  // registry system prompt editor) off-screen on long edits.
  const maxHeight = props.maxHeight ?? 480;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: props.placeholder ?? 'Start writing — / to insert a document' }),
      BoardMentionNode,
      DocumentMentionNode,
      MemoryMentionNode,
      TaskMentionNode,
    ],
    content: props.initialContent ?? emptyComposerDoc(),
    editorProps: {
      attributes: {
        'aria-label': props.ariaLabel ?? props.label ?? 'Rich text editor',
        class: 'composer-content',
      },
    },
    onUpdate: (event) => {
      const trigger = readActiveSlashTrigger(event.editor);
      setSlashTrigger(trigger);
      onChangeRef.current?.(event.editor.getJSON());
    },
    onSelectionUpdate: (event) => {
      setSlashTrigger(readActiveSlashTrigger(event.editor));
    },
    onBlur: (event) => {
      const doc = event.editor.getJSON();
      const cells = tipTapDocToCells(doc);
      const markdown = tipTapDocToMarkdown(doc);
      onCommitRef.current({ markdown, cells, doc });
    },
  });

  editorRef.current = editor;

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

  useEffect(() => {
    if (editor === null) {
      return;
    }
    editor.setEditable(!(props.disabled ?? false));
  }, [editor, props.disabled]);

  // Sync the editor's content when `initialContent` swaps to a new document
  // (e.g. the surrounding view switched which entity it's editing). Skipped
  // while the editor is focused so we never clobber in-flight typing — the
  // editor commits on blur, so by the time a new prop arrives via a sibling
  // selection change the user's edits are already persisted.
  useEffect(() => {
    if (editor === null || props.initialContent === undefined) {
      return;
    }
    if (editor.isFocused) {
      return;
    }
    const current = editor.getJSON();
    if (sameTipTapDoc(current, props.initialContent)) {
      return;
    }
    editor.commands.setContent(props.initialContent, false);
  }, [editor, props.initialContent]);

  return (
    <div className="flex w-full flex-col gap-1">
      {props.label !== undefined ? (
        <span className="text-[11px] font-medium text-content-muted">{props.label}</span>
      ) : null}
      <div className="relative rounded-md border border-border bg-surface transition-[border-color] duration-200 focus-within:border-accent">
        <EditorContent
          editor={editor}
          className="composer-editor w-full"
          style={{ minHeight, maxHeight, overflowY: 'auto' }}
        />
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
        open={slashTrigger !== null}
        query={slashTrigger?.query ?? ''}
      />
    </div>
  );
}

function sameTipTapDoc(left: JSONContent, right: JSONContent): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
