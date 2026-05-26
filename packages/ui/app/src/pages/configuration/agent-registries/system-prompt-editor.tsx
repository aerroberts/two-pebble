import type { JSONContent } from '@tiptap/core';
import { Select } from '@two-pebble/components';
import type { TipTapDocument, TipTapNode } from '@two-pebble/datatypes';
import { useDocuments } from '@two-pebble/realtime';
import { useMemo, useState } from 'react';
import { RichTextFieldHost } from '../../../shared/agent-input/rich-text-field-host';

export interface SystemPromptEditorProps {
  value: TipTapDocument;
  onChange: (next: JSONContent) => void;
}

type SystemPromptKind = 'inline' | 'document';

const systemPromptKindOptions = [
  { value: 'inline', label: 'Inline' },
  { value: 'document', label: 'Document' },
];

/**
 * Edits an agent registry's system prompt with a "type" dropdown.
 *
 * - **Inline**: a rich text editor that supports document-mention pills
 *   inside arbitrary prose (existing behaviour).
 * - **Document**: a single-document picker — the registry stores a
 *   prompt body that is just one `documentMention`, so the runtime
 *   resolves the picked document as the system prompt content.
 *
 * The selected mode is derived from the current prompt so old
 * registries continue to render in the right view without a schema
 * migration.
 */
export function SystemPromptEditor(props: SystemPromptEditorProps) {
  const detected = detectKindFromPrompt(props.value);
  const [kind, setKind] = useState<SystemPromptKind>(detected);
  const documents = useDocuments();

  const documentOptions = useMemo(() => {
    const value = documents.value;
    if (value === null) {
      return [];
    }
    const rows: { value: string; label: string }[] = [];
    for (const entry of value.values()) {
      if (entry.value !== null) {
        rows.push({ value: entry.value.id, label: entry.value.name || entry.value.id });
      }
    }
    rows.sort((a, b) => a.label.localeCompare(b.label));
    return rows;
  }, [documents.value]);

  const selectedDocumentId = extractSingleDocumentReference(props.value)?.documentId ?? '';

  const handleKindChange = (value: string) => {
    if (value !== 'inline' && value !== 'document') {
      return;
    }
    setKind(value);
    if (value === 'inline' && detected === 'document') {
      props.onChange(emptyInlinePrompt());
    }
    if (value === 'document' && selectedDocumentId.length === 0 && documentOptions.length > 0) {
      const first = documentOptions[0];
      if (first !== undefined) {
        props.onChange(buildDocumentMentionPrompt(first.value, first.label));
      }
    }
  };

  const handleDocumentChange = (documentId: string) => {
    const match = documentOptions.find((option) => option.value === documentId);
    if (match === undefined) {
      return;
    }
    props.onChange(buildDocumentMentionPrompt(match.value, match.label));
  };

  return (
    <>
      <Select
        fullWidth
        label="System prompt type"
        onChange={handleKindChange}
        options={systemPromptKindOptions}
        value={kind}
      />
      {kind === 'document' ? (
        <Select
          fullWidth
          label="System prompt document"
          onChange={handleDocumentChange}
          options={documentOptions}
          placeholder="Select a document"
          value={selectedDocumentId}
        />
      ) : (
        <RichTextFieldHost
          ariaLabel="System prompt"
          label="System prompt"
          minHeight={160}
          onCommit={(payload) => props.onChange(payload.doc)}
          placeholder="System prompt — / to reference a document"
          value={props.value}
        />
      )}
    </>
  );
}

function detectKindFromPrompt(doc: TipTapDocument): SystemPromptKind {
  return extractSingleDocumentReference(doc) === null ? 'inline' : 'document';
}

interface SingleDocumentReference {
  documentId: string;
  name: string;
}

function extractSingleDocumentReference(doc: TipTapDocument): SingleDocumentReference | null {
  const topLevel = (doc as TipTapNode).content ?? [];
  if (topLevel.length !== 1) {
    return null;
  }
  const onlyParagraph = topLevel[0];
  if (onlyParagraph === undefined || onlyParagraph.type !== 'paragraph') {
    return null;
  }
  const children = onlyParagraph.content ?? [];
  if (children.length !== 1) {
    return null;
  }
  const only = children[0];
  if (only === undefined || only.type !== 'documentMention') {
    return null;
  }
  const documentId = typeof only.attrs?.documentId === 'string' ? only.attrs.documentId : '';
  const name = typeof only.attrs?.name === 'string' ? only.attrs.name : '';
  if (documentId.length === 0) {
    return null;
  }
  return { documentId, name };
}

function buildDocumentMentionPrompt(documentId: string, name: string): TipTapDocument {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'documentMention', attrs: { documentId, name } }],
      },
    ],
  };
}

function emptyInlinePrompt(): TipTapDocument {
  return { type: 'doc', content: [{ type: 'paragraph' }] };
}
