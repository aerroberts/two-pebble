import type { ReactNode } from 'react';

export interface ChatPageLayoutProps {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
  width?: 'fixed' | 'full';
}

export function ChatPageLayout(props: ChatPageLayoutProps) {
  const width = props.width ?? 'full';
  const rootClassName =
    width === 'fixed'
      ? 'w-full min-h-0 flex flex-1 flex-col items-center bg-surface'
      : 'w-full min-h-0 flex flex-1 flex-col bg-surface';
  const sectionClassName =
    width === 'fixed' ? 'w-full max-w-[1200px] flex min-w-0 flex-col px-8' : 'flex min-w-0 flex-col px-8';

  return (
    <div className={rootClassName}>
      <header className={`${sectionClassName} shrink-0 pt-5`}>{props.header}</header>
      <div className={`${sectionClassName} min-h-0 flex-1 overflow-y-auto`}>{props.children}</div>
      <footer className={`${sectionClassName} shrink-0 pb-4 pt-3`}>{props.footer}</footer>
    </div>
  );
}
