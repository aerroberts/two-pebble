import type { ReactNode } from 'react';

export interface PageLayoutProps {
  children: ReactNode;
  width?: 'fixed' | 'full' | 'thin';
}

export function PageLayout(props: PageLayoutProps) {
  const width = props.width ?? 'fixed';
  const rootClassName =
    width === 'fixed' || width === 'thin'
      ? 'w-full min-h-0 flex flex-1 flex-col items-center overflow-auto bg-surface'
      : 'w-full min-h-0 flex flex-1 flex-col overflow-auto bg-surface';
  const mainClassName =
    width === 'fixed'
      ? 'w-full max-w-[1200px] flex-1 flex flex-col min-w-0 px-8 pt-5 pb-[400px]'
      : width === 'thin'
        ? 'w-full max-w-[880px] flex-1 flex flex-col min-w-0 px-6 pt-5 pb-[400px]'
        : 'flex-1 flex flex-col min-w-0 px-8 pt-5 pb-[400px]';

  return (
    <div className={rootClassName}>
      <main className={mainClassName}>{props.children}</main>
    </div>
  );
}
