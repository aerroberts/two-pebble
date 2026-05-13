import type { ReactNode } from 'react';

export interface AuxiliarySidebarLayoutProps {
  children: ReactNode;
  mobileSidebar?: ReactNode;
  sidebar: ReactNode;
  sidebarWidth?: 'comfortable' | 'wide';
}

export function AuxiliarySidebarLayout(props: AuxiliarySidebarLayoutProps) {
  const { sidebarWidth = 'comfortable' } = props;
  const sidebarColumnClassName =
    sidebarWidth === 'wide' ? 'md:grid-cols-[18rem_minmax(0,1fr)]' : 'md:grid-cols-[16rem_minmax(0,1fr)]';

  return (
    <div className={`grid h-dvh min-h-0 max-h-dvh grid-cols-1 overflow-hidden bg-surface ${sidebarColumnClassName}`}>
      <div className="auxiliary-sidebar-slide-in hidden h-dvh min-h-0 overflow-hidden border-r border-border bg-surface-alt md:block">
        {props.sidebar}
      </div>
      <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
        {props.mobileSidebar ? (
          <div className="shrink-0 border-b border-border bg-surface-alt px-3 py-2 md:hidden">
            {props.mobileSidebar}
          </div>
        ) : null}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{props.children}</div>
      </div>
    </div>
  );
}
