'use client';

import { type RichComposerDocument, type RichComposerSubmitPayload, RichTextField } from '@two-pebble/components';
import { markdownToTipTap } from '@two-pebble/datatypes';
import { useDocuments } from '@two-pebble/realtime';
import { useMemo } from 'react';

export interface RichTextFieldHostProps {
  /**
   * Current value in markdown form. Used to seed the editor; the field
   * keeps its own state thereafter and commits a new value on blur.
   */
  value: string;
  onCommit: (payload: RichComposerSubmitPayload) => void;
  label?: string;
  placeholder?: string;
  ariaLabel?: string;
  minHeight?: number;
  disabled?: boolean;
}

/**
 * Application-side host for `RichTextField`.
 *
 * Pulls documents from the realtime store, parses the incoming markdown
 * value into a TipTap document for the initial render, and passes the
 * commit payload back to the caller. Use this anywhere a plain text
 * area used to live — system prompts, task descriptions — to get
 * `/doc` mentions for free.
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

  const initialContent = useMemo(() => markdownToTipTap(props.value), [props.value]);

  return (
    <RichTextField
      ariaLabel={props.ariaLabel}
      disabled={props.disabled}
      documents={items}
      initialContent={initialContent}
      label={props.label}
      minHeight={props.minHeight}
      onCommit={props.onCommit}
      placeholder={props.placeholder}
    />
  );
}
