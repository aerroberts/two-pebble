import type { ReactNode } from 'react';
import { SidebarLayoutMobileNav } from './sidebar-layout-mobile-nav';
import type { SidebarLayoutNavigationSection } from './types';

export interface SidebarLayoutProps {
  sidebar: ReactNode;
  mobileSidebar?: ReactNode;
  mobileNavigation?: SidebarLayoutNavigationSection[];
  mobileNavigationPathname?: string;
  children: ReactNode;
  sidebarWidth?: 'comfortable' | 'wide';
}

export function SidebarLayout(props: SidebarLayoutProps) {
  const { sidebarWidth = 'comfortable' } = props;
  const sidebarColumnClassName =
    sidebarWidth === 'wide' ? 'md:grid-cols-[18rem_minmax(0,1fr)]' : 'md:grid-cols-[16rem_minmax(0,1fr)]';

  return (
    <div className={`grid h-dvh min-h-0 max-h-dvh grid-cols-1 overflow-hidden bg-surface ${sidebarColumnClassName}`}>
      <div className="hidden h-dvh min-h-0 overflow-hidden border-r border-border md:block">{props.sidebar}</div>
      <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
        {props.mobileSidebar ? (
          <div className="shrink-0 border-b border-border bg-surface px-3 py-2 md:hidden">{props.mobileSidebar}</div>
        ) : props.mobileNavigation ? (
          <div className="shrink-0 border-b border-border bg-surface px-3 py-2 md:hidden">
            <SidebarLayoutMobileNav sections={props.mobileNavigation} pathname={props.mobileNavigationPathname} />
          </div>
        ) : null}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{props.children}</div>
      </div>
    </div>
  );
}
