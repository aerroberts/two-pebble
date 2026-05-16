'use client';

import type { JSONContent } from '@tiptap/core';
import { type RichComposerDocument, type RichComposerSubmitPayload, RichTextField } from '@two-pebble/components';
import { useDocuments } from '@two-pebble/realtime';
import { useMemo } from 'react';

export interface RichTextFieldHostProps {
  /**
   * Initial TipTap document the editor renders. The host treats this
   * as a seed for first render; the field keeps its own state
   * thereafter and commits a new doc on blur.
   */
  value: JSONContent;
  onCommit: (payload: RichComposerSubmitPayload) => void;
  label?: string;
  placeholder?: string;
  ariaLabel?: string;
  minHeight?: number;
  disabled?: boolean;
}

/**
 * Application-side host for `RichTextField`. Pulls documents from the
 * realtime store and threads them into the editor's `/doc` slash
 * command. Used by any field that persists a TipTap document directly
 * (e.g. agent system prompts) so document mention pills round-trip
 * without the markdown bounce that drops their `documentId`.
 */
export function RichTextFieldHost(props: RichTextFieldHostProps) {
  const documents = useDocuments();
  const items = useMemo<RichComposerDocument[]>(() => {
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

  return (
    <RichTextField
      ariaLabel={props.ariaLabel}
      disabled={props.disabled}
      documents={items}
      initialContent={props.value}
      label={props.label}
      minHeight={props.minHeight}
      onCommit={props.onCommit}
      placeholder={props.placeholder}
    />
  );
}
