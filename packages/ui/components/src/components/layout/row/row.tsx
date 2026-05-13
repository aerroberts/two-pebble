import type { ReactNode } from 'react';

export interface RowProps {
  children?: ReactNode;
  /** Tailwind-style gap preset between row items. */
  gap?: 'xs' | 'sm' | 'md';
  /** Vertical alignment of row items. */
  align?: 'start' | 'center' | 'end';
}

const gapClasses = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-3',
} as const;

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
} as const;

/**
 * Horizontal stack used to compose action rows (e.g. send + voice capture button).
 * Encapsulates the flex + gap pattern so feature pages do not hand-roll classNames.
 */
export function Row(props: RowProps) {
  const gap = gapClasses[props.gap ?? 'sm'];
  const align = alignClasses[props.align ?? 'center'];
  return <div className={`flex ${align} ${gap}`}>{props.children}</div>;
}
