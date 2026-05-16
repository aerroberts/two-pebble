'use client';

import type { Editor, JSONContent } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { emptyComposerDoc } from './composer-doc';
import type { RichComposerDocument, RichComposerSlashTrigger, RichComposerSubmitPayload } from './composer-types';
import { DocumentMentionNode } from './document-mention-node';
import { SlashDocumentPopover } from './slash-document-popover';
import { readActiveSlashTrigger, replaceTriggerWithDocumentMention } from './slash-trigger';
import { tipTapDocToCells } from './tiptap-doc-to-cells';
import { tipTapDocToMarkdown } from './tiptap-doc-to-markdown';

export interface RichTextFieldProps {
  /** Initial TipTap JSON document. Pass `undefined` to start empty. */
  initialContent?: JSONContent;
  /** Documents available to the `/doc` slash command. */
  documents: ReadonlyArray<RichComposerDocument>;
  /** Fires on blur with the current markdown + structured cells. */
  onCommit: (payload: RichComposerSubmitPayload) => void;
  /** Fires on every edit. Use sparingly — every keystroke. */
  onChange?: (doc: JSONContent) => void;
  placeholder?: string;
  ariaLabel?: string;
  label?: string;
  minHeight?: number;
  disabled?: boolean;
}

/**
 * Plain rich-text edit surface.
 *
 * Shares the composer's `/doc` slash command and document-mention node
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

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: props.placeholder ?? 'Start writing — / to insert a document' }),
      DocumentMentionNode,
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

  const handleDocSelected = useCallback((selection: RichComposerDocument) => {
    const current = editorRef.current;
    const trigger = slashTriggerRef.current;
    if (current === null || trigger === null) {
      setSlashTrigger(null);
      return;
    }
    replaceTriggerWithDocumentMention(current, trigger, selection);
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

  return (
    <div className="flex w-full flex-col gap-1">
      {props.label !== undefined ? (
        <span className="text-[11px] font-medium text-content-muted">{props.label}</span>
      ) : null}
      <div className="relative rounded-md border border-border bg-surface transition-[border-color] duration-200 focus-within:border-accent">
        <EditorContent editor={editor} className="composer-editor w-full" style={{ minHeight }} />
      </div>
      <SlashDocumentPopover
        anchorLeft={slashTrigger?.anchorLeft ?? 0}
        anchorTop={slashTrigger?.anchorTop ?? 0}
        documents={props.documents}
        onCancel={handleSlashCancel}
        onSelect={handleDocSelected}
        open={slashTrigger !== null}
        query={slashTrigger?.query ?? ''}
      />
    </div>
  );
}
