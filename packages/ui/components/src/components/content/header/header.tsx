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
    <div className={`flex flex-col gap-2 ${spacingClass}`.trim()}>
      <div className="flex items-center justify-between gap-4">
        <h1 className="min-w-0 flex-1 break-words font-heading text-[18px] font-normal leading-7 tracking-[0.18em] text-content uppercase">
          {props.children}
        </h1>
        {props.actionItems ? <div className="flex h-7 shrink-0 items-center gap-2">{props.actionItems}</div> : null}
      </div>
      {props.subtitle ? <p className="text-sm text-content-muted">{props.subtitle}</p> : null}
    </div>
  );
}
