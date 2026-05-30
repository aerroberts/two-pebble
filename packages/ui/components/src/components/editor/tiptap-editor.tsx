import type { Editor, JSONContent } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { TextSelection } from '@tiptap/pm/state';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef } from 'react';
import { BoardMentionNode } from '../input/rich-message-composer/board-mention-node';
import { DocumentMentionNode } from '../input/rich-message-composer/document-mention-node';
import { CodeBlockLanguageNode } from './code-block-language-node';
import { CommentExtension } from './comment-extension';
import { createDocumentNodeExtensions } from './document-node-extensions';
import { readActiveSlashTrigger, type SlashTrigger } from './slash/slash-trigger';
import { TodoItemNode } from './todo-item-node';

export type { JSONContent };

export interface TipTapEditorProps {
  initialContent: JSONContent;
  placeholder?: string;
  editable?: boolean;
  onBlur?: (content: JSONContent) => void;
  onUpdate?: (content: JSONContent) => void;
  /**
   * Receives the live editor instance once it's mounted so callers can
   * attach surface-specific behaviours (toolbar commands, programmatic
   * inserts) without forking the base component.
   */
  onEditorReady?: (editor: Editor | null) => void;
  /**
   * Notified whenever the cursor enters or leaves a `/command` token in
   * the editor. Lets page-owned slash UI (hints, popovers) react without
   * each page wiring its own editor-event subscription, which is fragile
   * across React rerenders.
   */
  onSlashTrigger?: (trigger: SlashTrigger | null) => void;
  onCellClick?: (cellId: string, anchor: HTMLElement) => void;
  /**
   * Invoked from the editor's own `handleKeyDown` extension point —
   * fires before ProseMirror's defaults so a `true` return cleanly
   * suppresses the default key behaviour. Use this to commit a slash
   * trigger on Enter or intercept other shortcuts.
   */
  onKeyDown?: (editor: Editor, event: KeyboardEvent) => boolean;
}

export function TipTapEditor(props: TipTapEditorProps) {
  const propsRef = useRef(props);
  propsRef.current = props;
  const editorRef = useRef<Editor | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLanguageNode,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: props.placeholder ?? 'Start writing...' }),
      ...createDocumentNodeExtensions(),
      TodoItemNode,
      CommentExtension,
      BoardMentionNode,
      DocumentMentionNode,
    ],
    content: props.initialContent,
    editable: props.editable ?? true,
    editorProps: {
      attributes: {
        spellcheck: 'false',
      },
      handleKeyDown: (_view, event) => {
        const current = editorRef.current;
        const handler = propsRef.current.onKeyDown;
        if (current === null) {
          return false;
        }
        if (handler === undefined) {
          return handleEnterBeforeCodeBlock(current, event);
        }
        return handler(current, event) || handleEnterBeforeCodeBlock(current, event);
      },
      handleClick: (_view, _pos, event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
          return false;
        }
        const cell = target.closest('[data-cell-id]');
        if (!(cell instanceof HTMLElement)) {
          return false;
        }
        const cellId = cell.dataset.cellId ?? '';
        if (cellId.length === 0) {
          return false;
        }
        propsRef.current.onCellClick?.(cellId, cell);
        return false;
      },
    },
    onBlur: ({ editor: currentEditor }) => propsRef.current.onBlur?.(currentEditor.getJSON()),
    onUpdate: ({ editor: currentEditor }) => {
      propsRef.current.onSlashTrigger?.(readActiveSlashTrigger(currentEditor));
      propsRef.current.onUpdate?.(currentEditor.getJSON());
    },
    onSelectionUpdate: ({ editor: currentEditor }) => {
      propsRef.current.onSlashTrigger?.(readActiveSlashTrigger(currentEditor));
    },
  });

  editorRef.current = editor;

  useEffect(() => {
    props.onEditorReady?.(editor);
  }, [editor, props.onEditorReady]);

  useEffect(() => {
    if (editor === null) {
      return;
    }
    // While the user is actively editing, never reapply incoming content.
    // Autosave round-trips the document back through `initialContent`, so a
    // new object reference arrives mid-edit even though nothing external
    // changed. Calling setContent here would discard in-flight keystrokes and
    // jump the cursor to the end of the document. External updates are picked
    // up once the editor loses focus (or on remount via the document key).
    if (editor.isFocused) {
      return;
    }
    if (JSON.stringify(editor.getJSON()) === JSON.stringify(props.initialContent)) {
      return;
    }
    editor.commands.setContent(props.initialContent);
  }, [editor, props.initialContent]);

  return (
    <EditorContent
      editor={editor}
      spellCheck={false}
      className="document-editor min-h-[360px] text-sm text-content [&_.ProseMirror-focused]:outline-none [&_.ProseMirror]:relative [&_.ProseMirror]:min-h-[360px] [&_.ProseMirror_a]:text-accent [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-border-strong [&_.ProseMirror_blockquote]:pl-3 [&_.ProseMirror_h1]:text-xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-content-muted [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.comment-thread-widget]:pointer-events-none [&_.comment-thread-widget]:absolute [&_.comment-thread-widget]:-right-7 [&_.comment-thread-widget]:inline-flex [&_.comment-thread-widget]:h-5 [&_.comment-thread-widget]:w-5 [&_.comment-thread-widget]:items-center [&_.comment-thread-widget]:justify-center [&_.comment-thread-widget]:text-accent [&_.comment-thread-widget_svg]:h-3.5 [&_.comment-thread-widget_svg]:w-3.5 [&_.has-comment-thread]:rounded-sm [&_.has-comment-thread]:bg-surface [&_.two-pebble-comment-section]:hidden"
    />
  );
}

function handleEnterBeforeCodeBlock(editor: Editor, event: KeyboardEvent): boolean {
  if (event.key !== 'Enter' || event.shiftKey || event.altKey || event.metaKey || event.ctrlKey || event.isComposing) {
    return false;
  }
  const { state, view } = editor;
  const { selection } = state;
  if (!selection.empty) {
    return false;
  }
  const { $from } = selection;
  if ($from.parent.type.name !== 'paragraph' || $from.parentOffset !== $from.parent.content.size) {
    return false;
  }
  const parentEnd = $from.after();
  const nextNode = state.doc.nodeAt(parentEnd);
  const paragraphType = state.schema.nodes.paragraph;
  if (nextNode?.type.name !== 'codeBlock' || paragraphType === undefined) {
    return false;
  }

  event.preventDefault();
  const tr = state.tr.insert(parentEnd, paragraphType.create());
  tr.setSelection(TextSelection.create(tr.doc, parentEnd + 1));
  view.dispatch(tr.scrollIntoView());
  return true;
}
