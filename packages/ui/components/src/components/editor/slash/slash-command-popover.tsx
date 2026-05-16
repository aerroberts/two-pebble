'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../../content/icon/icon';

export interface SlashCommand {
  /** Internal identifier — what `slashTrigger.command` is matched against. */
  id: string;
  /** Visible label rendered in the menu row. */
  label: string;
  /** One-line hint shown to the right of the label. */
  description: string;
  /** Lucide icon name (kebab-case) rendered next to the label. */
  icon: string;
}

export interface SlashCommandPopoverProps {
  /** Active slash trigger; popover hides when this is false. */
  open: boolean;
  /** Viewport-anchored coordinate for the top-left of the popover. */
  anchorLeft: number;
  anchorTop: number;
  /** The text typed after `/` (lowercased, no args). */
  query: string;
  commands: ReadonlyArray<SlashCommand>;
  onSelect: (command: SlashCommand) => void;
  onCancel: () => void;
}

/**
 * Inline popover that surfaces the list of slash commands available
 * inside the document editor. Mirrors `SlashDocumentPopover` so the
 * filter / arrow-key / Enter UX is identical across surfaces; pulled
 * out as a separate component so the chat composer's `/doc` picker
 * and the document editor's command menu don't share their unrelated
 * data shapes.
 *
 * Keyboard handling listens at the window level: the editor still
 * owns focus while this popover is open, so synthetic key handlers
 * attached to the popover element would never fire.
 */
export function SlashCommandPopover(props: SlashCommandPopoverProps) {
  const [rawActiveIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(
    () =>
      props.query.length === 0
        ? props.commands
        : props.commands.filter(
            (command) => command.id.startsWith(props.query) || command.label.toLowerCase().includes(props.query),
          ),
    [props.query, props.commands],
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
      className="z-[1100] fixed flex w-[260px] flex-col overflow-hidden rounded-md border border-border bg-surface-raised shadow-modal"
      style={{ left: props.anchorLeft, top: props.anchorTop + 4 }}
      role="listbox"
      aria-label="Insert block"
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <Icon color="text-content-muted" name="list-checks" />
        <span className="text-[11px] font-medium text-content-muted">
          {props.query.length === 0 ? 'Insert block' : `Matching “${props.query}”`}
        </span>
      </div>
      {filtered.length === 0 ? (
        <div className="px-3 py-3 text-[12px] text-content-muted">No matching commands.</div>
      ) : (
        <ul className="max-h-[240px] overflow-y-auto py-1">
          {filtered.map((command, index) => (
            <li key={command.id}>
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
                  props.onSelect(command);
                }}
              >
                <Icon color="text-content-muted" name={command.icon} />
                <span className="flex-1 truncate font-medium">{command.label}</span>
                <span className="text-content-muted">{command.description}</span>
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
