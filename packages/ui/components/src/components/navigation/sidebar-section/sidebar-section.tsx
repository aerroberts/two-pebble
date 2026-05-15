import { type MouseEventHandler, type ReactNode, useState } from 'react';

import { Icon } from '../../content/icon/icon';

export interface SidebarSectionProps {
  active?: boolean;
  children?: ReactNode;
  /** When true, clicking the header toggles a body open/closed state. */
  collapsible?: boolean;
  /** When `collapsible`, starts collapsed if true. Defaults to false. */
  defaultCollapsed?: boolean;
  href?: string;
  onClick?: MouseEventHandler;
  title: ReactNode;
}

export function SidebarSection(props: SidebarSectionProps) {
  const { active, children, collapsible = false, defaultCollapsed = false, href, title, onClick } = props;
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const isInteractive = collapsible || !!onClick || !!href;
  const titleClass = active ? 'text-accent' : 'text-content-muted';
  const interactiveClass = isInteractive ? 'cursor-pointer hover:text-content transition-colors' : '';
  const spacingClass = 'gap-2 px-2';
  const headerClass = `flex w-full items-center overflow-visible rounded-lg py-1.5 text-left font-heading text-[12px] font-normal leading-4 tracking-[0.08em] ${spacingClass} ${titleClass} ${interactiveClass}`;
  const chevronNode = collapsible ? (
    <Icon name={collapsed ? 'chevron-right' : 'chevron-down'} color="text-current" />
  ) : null;
  const headerContent = (
    <>
      {chevronNode}
      <span className="truncate">{title}</span>
    </>
  );

  const handleHeaderClick: MouseEventHandler = (event) => {
    if (collapsible) {
      setCollapsed((prev) => !prev);
    }
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <div className="pt-5 first:pt-0">
      {href ? (
        <a className={headerClass} href={href} onClick={handleHeaderClick}>
          {headerContent}
        </a>
      ) : isInteractive ? (
        <button type="button" className={`${headerClass} border-0 bg-transparent`} onClick={handleHeaderClick}>
          {headerContent}
        </button>
      ) : (
        <div className={headerClass}>{headerContent}</div>
      )}
      {children && !collapsed ? <div className="space-y-0.5">{children}</div> : null}
    </div>
  );
}
