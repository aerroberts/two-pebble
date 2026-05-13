import type { ReactNode } from 'react';
import { defaultTone, type PlaceholderTone, toneClasses } from './placeholder-tones';

export type { PlaceholderTone };

export interface PlaceholderProps {
  /** Simple text label (used when title/description are not provided). */
  label?: string;
  /** Prominent heading for the empty state. */
  title?: string;
  /** Supporting text below the title. */
  description?: string;
  /** Optional action element (e.g. a button) rendered below the description. */
  action?: ReactNode;
  minHeight?: string;
  tone?: PlaceholderTone;
}

export function Placeholder(props: PlaceholderProps) {
  const tone = props.tone ?? defaultTone;
  const classes = toneClasses[tone];
  const minHeight = props.minHeight ?? '100%';

  if (props.title) {
    return (
      <div
        className={`flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed px-8 py-12 text-center ${classes}`}
        style={{ minHeight }}
      >
        <div className="text-[16px] font-semibold text-content">{props.title}</div>
        {props.description && <div className="mt-1.5 text-[13px] text-content-muted">{props.description}</div>}
        {props.action && <div className="mt-4">{props.action}</div>}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-1 items-center justify-center rounded-lg border border-dashed text-[12px] font-medium ${classes}`}
      style={{ minHeight }}
    >
      {props.label ?? 'Content'}
    </div>
  );
}
