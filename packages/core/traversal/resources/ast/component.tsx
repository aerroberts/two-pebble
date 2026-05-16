import type { ReactNode } from 'react';

export interface PanelProps {
  title: string;
  children: ReactNode;
}

/**
 * Renders a labeled panel.
 */
export function Panel({ title, children }: PanelProps) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
