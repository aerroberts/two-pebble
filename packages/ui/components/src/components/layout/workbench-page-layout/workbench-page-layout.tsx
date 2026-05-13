import type { ReactNode } from 'react';

export type WorkbenchPageLayoutBody = 'fill' | 'padded-scroll';

export interface WorkbenchPageLayoutProps {
  header: ReactNode;
  children: ReactNode;
  body?: WorkbenchPageLayoutBody;
}

export function WorkbenchPageLayout(props: WorkbenchPageLayoutProps) {
  const variant = props.body ?? 'fill';
  const bodyClass = variant === 'fill' ? 'min-h-0 flex-1 overflow-hidden' : 'min-h-0 flex-1 overflow-auto px-6 py-4';
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-border bg-surface px-6 py-2.5">{props.header}</header>
      <div className={bodyClass}>{props.children}</div>
    </div>
  );
}
