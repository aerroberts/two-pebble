import type { SlashTrigger } from './slash-trigger';

export interface SlashTaskHintProps {
  trigger: SlashTrigger;
}

/**
 * Minimal inline hint anchored to a `/task` slash trigger. Purely
 * visual: the consuming page handles Enter via the editor's
 * `onKeyDown` extension point and commits the trigger from there. This
 * keeps the hint dumb and avoids racing window-level keydown listeners
 * against ProseMirror's own handlers.
 */
export function SlashTaskHint(props: SlashTaskHintProps) {
  const label =
    props.trigger.query.length === 0
      ? 'Press Enter to add a task'
      : `Press Enter to add task: ${props.trigger.query}`;

  return (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-50 rounded-md border border-border bg-surface px-2 py-1 text-[11px] font-medium text-content-muted shadow-sm"
      style={{ left: props.trigger.anchorLeft, top: props.trigger.anchorTop + 4 }}
    >
      {label}
    </div>
  );
}
