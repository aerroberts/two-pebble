import type { ReactNode } from 'react';

export interface HeaderProps {
  children: ReactNode;
  subtitle?: ReactNode;
  actionItems?: ReactNode;
  /**
   * When true, removes the default bottom padding so the header fits tightly
   * inside a parent that already provides chrome (e.g. a bordered HeaderLayout).
   * Defaults to false.
   */
  compact?: boolean;
}

export function Header(props: HeaderProps) {
  const spacingClass = props.compact ? '' : 'pb-6';
  return (
    <div className={`flex items-start justify-between ${spacingClass}`.trim()}>
      <div>
        <h1 className="font-heading text-[18px] font-normal leading-7 tracking-[0.18em] text-content uppercase">
          {props.children}
        </h1>
        {props.subtitle ? <p className="mt-2 text-sm text-content-muted">{props.subtitle}</p> : null}
      </div>
      {props.actionItems ? <div className="flex h-7 items-center gap-2">{props.actionItems}</div> : null}
    </div>
  );
}
