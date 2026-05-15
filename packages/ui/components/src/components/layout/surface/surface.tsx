import type { ReactNode } from 'react';

export interface SurfaceProps {
  children?: ReactNode;
}

/**
 * Standard surface card used for inset content blocks across the app.
 * Encapsulates the rounded background + padding pattern so feature pages do
 * not need to hand-roll className strings (which the app guard forbids).
 */
export function Surface(props: SurfaceProps) {
  return <div className="rounded-md bg-surface p-4">{props.children}</div>;
}
