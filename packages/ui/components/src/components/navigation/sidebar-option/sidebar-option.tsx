import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import { Icon } from '../../content/icon/icon';

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & { href?: undefined };
type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className'> & { href: string };

export type SidebarOptionProps = (ButtonProps | AnchorProps) & {
  active?: boolean;
  badge?: ReactNode;
  icon?: string;
  description?: ReactNode;
  label: ReactNode;
};

export function SidebarOption(props: SidebarOptionProps) {
  const { active = false, badge, icon, description, label, href, ...rest } = props;
  const textClass = active ? 'text-accent' : 'text-content-muted hover:text-content';
  const spacingClass = icon ? 'gap-2.5 px-2.5' : 'px-3';
  const rootClass = `group relative flex w-full items-start overflow-visible rounded-lg py-1.5 text-left text-[12px] leading-4 transition-colors ${spacingClass} ${textClass}`;
  const trailingNode = badge ? (
    <span className="shrink-0 rounded-full bg-content/[0.06] px-2 py-0.5 text-[11px] font-semibold text-content-muted">
      {badge}
    </span>
  ) : null;

  const iconNode = icon ? (
    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-accent">
      <Icon name={icon} color="text-current" />
    </span>
  ) : null;

  const content = (
    <>
      {iconNode}
      <span className="relative z-10 min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate font-heading font-normal tracking-[0.08em]">{label}</span>
          {trailingNode}
        </span>
        {description ? (
          <span className="mt-1 block text-[11px] leading-4 text-content-subtle">{description}</span>
        ) : null}
      </span>
    </>
  );

  if (href != null) {
    const anchorRest = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a className={rootClass} href={href} onClick={anchorRest.onClick}>
        {content}
      </a>
    );
  }

  const { type = 'button', ...buttonRest } = rest as Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'children' | 'className'
  >;
  return (
    <button className={rootClass} type={type} {...buttonRest}>
      {content}
    </button>
  );
}
