import type { ReactNode } from 'react';

export interface HeaderLayoutProps {
  header: ReactNode;
  /**
   * Optional row rendered below the header and above the main content area.
   * Stays full-width and left-aligned even when `centered` is set on the main area —
   * use this for sub-navigation (breadcrumbs, step indicators) that should sit at the
   * top-left of the viewport rather than centered with the page content.
   */
  subheader?: ReactNode;
  children: ReactNode;
  /**
   * When true, centers children horizontally and vertically in the main area.
   * Use for onboarding / wizard flows where a single fixed-width card sits in the middle of the viewport.
   * Defaults to false (children fill the main area from top-left).
   */
  centered?: boolean;
  /**
   * When true, the header slot gets a bottom border, surface background, and horizontal padding
   * so it reads as a distinct top nav. Use when your header content doesn't already bring its own
   * chrome (e.g. a simple Header-based topbar). Defaults to false.
   */
  bordered?: boolean;
}

export function HeaderLayout(props: HeaderLayoutProps) {
  const mainClasses = props.centered
    ? 'flex-1 min-h-0 flex flex-col items-center justify-center overflow-auto px-4 py-12'
    : 'flex-1 min-h-0 flex flex-col overflow-hidden';

  const headerClasses = props.bordered ? 'shrink-0 border-b border-border bg-surface px-6 py-2' : 'shrink-0';

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className={headerClasses}>{props.header}</header>
      {props.subheader ? <div className="shrink-0">{props.subheader}</div> : null}
      <main className={mainClasses}>{props.children}</main>
    </div>
  );
}
