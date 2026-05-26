'use client';

import { Icon } from '@two-pebble/components';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

interface ReferenceItem {
  id: string;
  name: string;
}

export type DocumentInsertSelection =
  | { kind: 'task' }
  | { kind: 'document'; item: ReferenceItem }
  | { kind: 'board'; item: ReferenceItem };

export interface DocumentInsertPopoverProps {
  open: boolean;
  anchorLeft: number;
  anchorTop: number;
  /**
   * Lowercased query the user typed after `/`. May be empty when the user
   * has only pressed `/` so far.
   */
  query: string;
  documents: ReadonlyArray<ReferenceItem>;
  boards: ReadonlyArray<ReferenceItem>;
  onSelect: (selection: DocumentInsertSelection) => void;
  onCancel: () => void;
}

interface DisplayRow {
  key: string;
  icon: string;
  label: string;
  detail: string;
  selection: DocumentInsertSelection;
}

/**
 * Slash menu for the document editor: lists the `Task` insert action
 * alongside document and board reference items so users can mention
 * other content from the same picker that already creates todos.
 */
export function DocumentInsertPopover(props: DocumentInsertPopoverProps) {
  const [rawActiveIndex, setActiveIndex] = useState(0);

  const rows = useMemo<DisplayRow[]>(() => {
    const all: DisplayRow[] = [
      {
        key: 'task',
        icon: 'list-todo',
        label: 'Task',
        detail: 'Add a checklist item',
        selection: { kind: 'task' },
      },
      ...props.documents.map<DisplayRow>((item) => ({
        key: `document:${item.id}`,
        icon: 'file-text',
        label: item.name.length > 0 ? item.name : 'Untitled document',
        detail: 'doc',
        selection: { kind: 'document', item },
      })),
      ...props.boards.map<DisplayRow>((item) => ({
        key: `board:${item.id}`,
        icon: 'layout-dashboard',
        label: item.name.length > 0 ? item.name : 'Untitled board',
        detail: 'board',
        selection: { kind: 'board', item },
      })),
    ];
    const query = props.query.trim().toLowerCase();
    if (query.length === 0) {
      return all;
    }
    return all.filter((row) => row.label.toLowerCase().includes(query) || row.detail.includes(query));
  }, [props.documents, props.boards, props.query]);

  const activeIndex = clamp(rawActiveIndex, 0, Math.max(rows.length - 1, 0));

  useEffect(() => {
    if (!props.open) {
      return undefined;
    }
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        props.onCancel();
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, Math.max(rows.length - 1, 0)));
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        return;
      }
      if (event.key === 'Enter') {
        const selection = rows[activeIndex];
        if (selection !== undefined) {
          event.preventDefault();
          props.onSelect(selection.selection);
        }
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => {
      window.removeEventListener('keydown', handler, true);
    };
  }, [props.open, props, rows, activeIndex]);

  if (!props.open || typeof document === 'undefined') {
    return null;
  }

  const popover = (
    <div
      className="z-[1100] fixed flex w-[280px] flex-col overflow-hidden rounded-md border border-border bg-surface-raised shadow-modal"
      style={{ left: props.anchorLeft, top: props.anchorTop + 4 }}
      // biome-ignore lint/a11y/useSemanticElements: floating popover, not an inline form control
      role="listbox"
      aria-label="Insert into document"
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <Icon color="text-content-muted" name="slash" />
        <span className="text-[11px] font-medium text-content-muted">
          {props.query.length === 0 ? 'Insert into document' : `Matching “${props.query}”`}
        </span>
      </div>
      {rows.length === 0 ? (
        <div className="px-3 py-3 text-[12px] text-content-muted">No matches.</div>
      ) : (
        <ul className="max-h-[240px] overflow-y-auto py-1">
          {rows.map((row, index) => (
            <li key={row.key}>
              <button
                type="button"
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors ${
                  index === activeIndex
                    ? 'bg-surface-hover text-content'
                    : 'text-content-muted hover:bg-surface-hover hover:text-content'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  props.onSelect(row.selection);
                }}
              >
                <Icon color="text-content-muted" name={row.icon} />
                <span className="min-w-0 flex-1 truncate font-medium">{row.label}</span>
                <span className="shrink-0 text-[10px] uppercase text-content-subtle">{row.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return createPortal(popover, document.body);
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}
