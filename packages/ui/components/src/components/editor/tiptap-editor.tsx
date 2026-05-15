import type { JSONContent } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

export type { JSONContent };

export interface TipTapEditorProps {
  initialContent: JSONContent;
  placeholder?: string;
  editable?: boolean;
  onBlur?: (content: JSONContent) => void;
}

export function TipTapEditor(props: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: props.placeholder ?? 'Start writing...' }),
    ],
    content: props.initialContent,
    editable: props.editable ?? true,
    onBlur: ({ editor: currentEditor }) => props.onBlur?.(currentEditor.getJSON()),
  });

  useEffect(() => {
    if (editor === null) {
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
      className="min-h-[360px] rounded-md border border-border bg-surface-raised px-4 py-3 text-sm leading-6 text-content [&_.ProseMirror-focused]:outline-none [&_.ProseMirror]:min-h-[330px] [&_.ProseMirror_a]:text-accent [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-border-strong [&_.ProseMirror_blockquote]:pl-3 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:bg-surface-alt [&_.ProseMirror_code]:px-1 [&_.ProseMirror_h1]:text-xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-content-muted [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p]:my-2 [&_.ProseMirror_pre]:overflow-auto [&_.ProseMirror_pre]:rounded-md [&_.ProseMirror_pre]:bg-background [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5"
    />
  );
}
