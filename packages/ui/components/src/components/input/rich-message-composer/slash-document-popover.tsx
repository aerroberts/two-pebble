'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../../content/icon/icon';
import type {
  RichComposerBoard,
  RichComposerDocument,
  RichComposerMemory,
  RichComposerReference,
  RichComposerSkill,
  RichComposerTask,
} from './composer-types';

export interface SlashDocumentPopoverProps {
  /** Active slash trigger; popover hides when this is null. */
  open: boolean;
  /** Viewport-anchored coordinate for the top-left of the popover. */
  anchorLeft: number;
  anchorTop: number;
  /** Lowercase substring filter applied to the reference list. */
  query: string;
  boards?: ReadonlyArray<RichComposerBoard>;
  documents: ReadonlyArray<RichComposerDocument>;
  tasks?: ReadonlyArray<RichComposerTask>;
  onSelect: (document: RichComposerDocument) => void;
  onCancel: () => void;
}

export interface SlashReferencePopoverProps {
  /** Active slash trigger; popover hides when this is null. */
  open: boolean;
  /** Viewport-anchored coordinate for the top-left of the popover. */
  anchorLeft: number;
  anchorTop: number;
  /** Lowercase substring filter applied to all references. */
  query: string;
  boards: ReadonlyArray<RichComposerBoard>;
  documents: ReadonlyArray<RichComposerDocument>;
  tasks: ReadonlyArray<RichComposerTask>;
  memories: ReadonlyArray<RichComposerMemory>;
  skills: ReadonlyArray<RichComposerSkill>;
  onSelect: (reference: RichComposerReference) => void;
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
export function SlashReferencePopover(props: SlashReferencePopoverProps) {
  const [rawActiveIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(
    () =>
      buildReferences(props.documents, props.boards, props.tasks, props.memories, props.skills).filter((reference) =>
        props.query.length === 0
          ? true
          : reference.item.name.toLowerCase().includes(props.query) || reference.type.includes(props.query),
      ),
    [props.query, props.documents, props.boards, props.tasks, props.memories, props.skills],
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

  if (!props.open || typeof document === 'undefined') {
    return null;
  }

  const popover = (
    <div
      className="z-[1100] fixed flex w-[280px] flex-col overflow-hidden rounded-md border border-border bg-surface-raised shadow-modal"
      style={{ left: props.anchorLeft, top: props.anchorTop + 4 }}
      role="listbox"
      aria-label="Insert reference"
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <Icon color="text-content-muted" name="slash" />
        <span className="text-[11px] font-medium text-content-muted">
          {props.query.length === 0 ? 'Insert reference' : `Matching “${props.query}”`}
        </span>
      </div>
      {filtered.length === 0 ? (
        <div className="px-3 py-3 text-[12px] text-content-muted">No matching references.</div>
      ) : (
        <ul className="max-h-[240px] overflow-y-auto py-1">
          {filtered.map((reference, index) => (
            <li key={`${reference.type}:${reference.item.id}`}>
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
                  props.onSelect(reference);
                }}
              >
                <Icon
                  color="text-content-muted"
                  name={
                    reference.type === 'document'
                      ? 'file-text'
                      : reference.type === 'task'
                        ? 'list-todo'
                        : reference.type === 'memory'
                          ? 'brain'
                          : reference.type === 'skill'
                            ? 'book-marked'
                            : 'layout-dashboard'
                  }
                />
                <span className="min-w-0 flex-1 truncate font-medium">{reference.item.name}</span>
                <span className="shrink-0 text-[10px] uppercase text-content-subtle">{reference.type}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return createPortal(popover, document.body);
}

export function SlashDocumentPopover(props: SlashDocumentPopoverProps) {
  return (
    <SlashReferencePopover
      anchorLeft={props.anchorLeft}
      anchorTop={props.anchorTop}
      boards={props.boards ?? []}
      documents={props.documents}
      skills={[]}
      tasks={props.tasks ?? []}
      memories={[]}
      onCancel={props.onCancel}
      onSelect={(reference) => {
        if (reference.type === 'document') {
          props.onSelect(reference.item);
        }
      }}
      open={props.open}
      query={props.query}
    />
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

function buildReferences(
  documents: ReadonlyArray<RichComposerDocument>,
  boards: ReadonlyArray<RichComposerBoard>,
  tasks: ReadonlyArray<RichComposerTask>,
  memories: ReadonlyArray<RichComposerMemory>,
  skills: ReadonlyArray<RichComposerSkill>,
): RichComposerReference[] {
  return [
    ...documents.map((item) => ({ type: 'document' as const, item })),
    ...boards.map((item) => ({ type: 'board' as const, item })),
    ...tasks.map((item) => ({ type: 'task' as const, item })),
    ...memories.map((item) => ({ type: 'memory' as const, item })),
    ...skills.map((item) => ({ type: 'skill' as const, item })),
  ].sort((left, right) => left.item.name.localeCompare(right.item.name));
}
