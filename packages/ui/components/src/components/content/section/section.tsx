import type { ReactNode } from 'react';

export interface SectionProps {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  actionItems?: ReactNode;
  compact?: boolean;
}

export function Section(props: SectionProps) {
  const hasHeader = props.title || props.actionItems;
  return (
    <section className={props.compact ? 'py-2' : 'py-6'}>
      {hasHeader ? (
        <div
          className={
            props.compact ? 'flex items-center justify-between mb-2' : 'flex items-center justify-between mb-3'
          }
        >
          {props.title ? (
            <div className="flex flex-col">
              <h2 className="font-heading text-[13px] font-normal leading-6 tracking-[0.22em] text-content uppercase">
                {props.title}
              </h2>
              {props.subtitle ? <p className="text-[12px] leading-4 text-content-muted">{props.subtitle}</p> : null}
            </div>
          ) : null}
          {props.actionItems ? <div className="flex items-center gap-1">{props.actionItems}</div> : null}
        </div>
      ) : null}
      <div className="flex flex-col gap-3">{props.children}</div>
    </section>
  );
}
