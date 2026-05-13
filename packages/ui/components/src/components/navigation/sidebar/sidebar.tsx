import type { HTMLAttributes, ReactNode } from 'react';

export interface SidebarProps extends Omit<HTMLAttributes<HTMLElement>, 'className'> {
  branding?: ReactNode;
  brandingTitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  tone?: 'default' | 'auxiliary';
}

export function Sidebar(props: SidebarProps) {
  const { branding, brandingTitle, children, footer, tone = 'default', ...rest } = props;
  const backgroundClass = tone === 'auxiliary' ? 'bg-surface-alt' : 'bg-surface';

  return (
    <aside className={`flex h-full min-h-0 w-full flex-col overflow-hidden pt-1 ${backgroundClass}`} {...rest}>
      {branding ? (
        <div className="flex items-center gap-2.5 px-3 pt-1 pb-3">
          {branding}
          {brandingTitle ? (
            <span className="font-heading text-[13px] font-normal uppercase tracking-[0.22em] text-content">
              {brandingTitle}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className={`flex-1 overflow-y-auto px-3 pb-4 ${branding ? '' : 'pt-1'}`}>{children}</div>
      {footer ? <div className={`${backgroundClass} px-3 py-3`}>{footer}</div> : null}
    </aside>
  );
}
