'use client';

import * as RadixTooltip from '@radix-ui/react-tooltip';
import { isValidElement, type ReactNode } from 'react';

export type TooltipData = Record<string, ReactNode>;

export interface TooltipProps {
  children: ReactNode;
  content?: ReactNode;
  data?: TooltipData;
  header?: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  compact?: boolean;
  padding?: 'default' | 'sm' | 'none';
  contentClassName?: string;
  defaultOpen?: boolean;
}

export function Tooltip(props: TooltipProps) {
  const hasData = props.data !== undefined;
  const resolvedPadding = props.padding ?? (props.compact || hasData ? 'none' : 'default');
  const paddingClass = resolvedPadding === 'none' ? '' : resolvedPadding === 'sm' ? 'p-1' : 'px-3 py-2.5';
  const baseClass =
    'tooltip-card z-50 max-w-[320px] rounded-md text-xs leading-5 shadow-panel data-[state=closed]:opacity-0 data-[state=delayed-open]:opacity-100 data-[state=instant-open]:opacity-100 data-[side=top]:data-[state=delayed-open]:-translate-y-0.5 data-[side=bottom]:data-[state=delayed-open]:translate-y-0.5 data-[side=left]:data-[state=delayed-open]:-translate-x-0.5 data-[side=right]:data-[state=delayed-open]:translate-x-0.5 transition-[opacity,transform] duration-150';
  const className = [baseClass, paddingClass, props.contentClassName].filter(Boolean).join(' ');
  const content =
    props.data === undefined ? (
      props.content
    ) : (
      <TooltipDataContent data={props.data} header={props.header} content={props.content} />
    );

  return (
    <RadixTooltip.Root defaultOpen={props.defaultOpen}>
      <RadixTooltip.Trigger asChild>{renderTooltipTrigger(props.children)}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content className={className} side={props.side ?? 'top'} sideOffset={props.sideOffset ?? 6}>
          {content}
          <RadixTooltip.Arrow className="fill-[var(--color-tooltip-surface)]" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}

function renderTooltipTrigger(children: ReactNode) {
  if (isValidElement(children) && typeof children.type === 'string') {
    return children;
  }

  return <span className="inline-flex">{children}</span>;
}

interface TooltipDataContentProps {
  data: TooltipData;
  header?: ReactNode;
  content?: ReactNode;
}

function TooltipDataContent(props: TooltipDataContentProps) {
  const entries = Object.entries(props.data);

  return (
    <div className="min-w-[200px] max-w-[320px]">
      {props.header ? (
        <div className="truncate border-b border-[var(--color-tooltip-border)] px-2 py-1 text-xs font-medium text-[var(--color-tooltip-foreground)]">
          {props.header}
        </div>
      ) : null}
      <div className="divide-y divide-[var(--color-tooltip-border)]">
        {entries.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[minmax(72px,120px)_minmax(0,1fr)] gap-3 px-2 py-1.5">
            <div
              className="min-w-0 truncate text-[11px] text-[var(--color-tooltip-foreground)] opacity-60"
              title={label}
            >
              {label}
            </div>
            <div
              className="min-w-0 truncate text-right text-xs text-[var(--color-tooltip-foreground)]"
              title={readTitle(value)}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
      {props.content ? <div className="border-t border-[var(--color-tooltip-border)] p-1">{props.content}</div> : null}
    </div>
  );
}

function readTitle(value: ReactNode) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;
}
