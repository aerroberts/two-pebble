'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../content/icon/icon';
import type { RichComposerDocument } from './composer-types';

export interface SlashDocumentPopoverProps {
  /** Active slash trigger; popover hides when this is null. */
  open: boolean;
  /** Viewport-anchored coordinate for the top-left of the popover. */
  anchorLeft: number;
  anchorTop: number;
  /** Lowercase substring filter applied to the document list. */
  query: string;
  documents: ReadonlyArray<RichComposerDocument>;
  onSelect: (document: RichComposerDocument) => void;
  onCancel: () => void;
}

/**
 * Inline popover anchored under the active `/` trigger.
 *
 * Replaces the legacy fullscreen modal so the picker feels like a true
 * slash command — appears the moment the user types `/` and filters as
 * they keep typing. Arrow keys + Enter select; Escape cancels.
 *
 * Keyboard handling deliberately listens on `keydown` at the document
 * level: the editor still owns focus while this popover is open, so
 * synthetic key handlers attached to the popover itself would never fire.
 */
export function SlashDocumentPopover(props: SlashDocumentPopoverProps) {
  const [rawActiveIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(
    () =>
      props.query.length === 0
        ? props.documents
        : props.documents.filter((doc) => doc.name.toLowerCase().includes(props.query)),
    [props.query, props.documents],
  );
  const activeIndex = clamp(rawActiveIndex, 0, Math.max(filtered.length - 1, 0));

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
        setActiveIndex((index) => Math.min(index + 1, Math.max(filtered.length - 1, 0)));
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        return;
      }
      if (event.key === 'Enter') {
        const selection = filtered[activeIndex];
        if (selection !== undefined) {
          event.preventDefault();
          props.onSelect(selection);
        }
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => {
      window.removeEventListener('keydown', handler, true);
    };
  }, [props.open, props, filtered, activeIndex]);

  if (!props.open) {
    return null;
  }

  return (
    <div
      className="z-[1100] fixed flex w-[280px] flex-col overflow-hidden rounded-md border border-border bg-surface-raised shadow-modal"
      style={{ left: props.anchorLeft, top: props.anchorTop + 4 }}
      role="listbox"
      aria-label="Insert document"
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <Icon color="text-content-muted" name="file-text" />
        <span className="text-[11px] font-medium text-content-muted">
          {props.query.length === 0 ? 'Insert document' : `Matching “${props.query}”`}
        </span>
      </div>
      {filtered.length === 0 ? (
        <div className="px-3 py-3 text-[12px] text-content-muted">
          No matching documents. Create one in the Documents tab.
        </div>
      ) : (
        <ul className="max-h-[240px] overflow-y-auto py-1">
          {filtered.map((doc, index) => (
            <li key={doc.id}>
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
                  props.onSelect(doc);
                }}
              >
                <Icon color="text-content-muted" name="file-text" />
                <span className="truncate font-medium">{doc.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
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
