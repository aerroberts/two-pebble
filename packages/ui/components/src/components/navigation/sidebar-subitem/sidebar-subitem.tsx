import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & { href?: undefined };
type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className'> & { href: string };

export type SidebarSubitemProps = (ButtonProps | AnchorProps) & {
  active?: boolean;
  label: ReactNode;
  trailing?: ReactNode;
};

export function SidebarSubitem(props: SidebarSubitemProps) {
  const { active = false, label, trailing, href, ...rest } = props;
  const textClass = active ? 'text-accent' : 'text-content-subtle hover:text-content';
  const rootClass = `group relative flex w-full items-center gap-2 rounded-md py-1 pl-8 pr-2 text-left text-[11px] leading-4 transition-colors ${textClass}`;
  const labelClass =
    'min-w-0 flex-1 cursor-pointer truncate border-0 bg-transparent p-0 text-left font-heading font-normal text-inherit no-underline';

  if (href != null) {
    const anchorRest = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <div className={rootClass}>
        <a className={labelClass} href={href} {...anchorRest}>
          {label}
        </a>
        {trailing}
      </div>
    );
  }

  const { type = 'button', ...buttonRest } = rest as Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'children' | 'className'
  >;
  return (
    <div className={rootClass}>
      <button className={labelClass} type={type} {...buttonRest}>
        {label}
      </button>
      {trailing}
    </div>
  );
}
