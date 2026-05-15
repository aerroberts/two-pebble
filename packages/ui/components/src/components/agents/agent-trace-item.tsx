'use client';

import type { icons } from 'lucide-react';
import type { ReactNode } from 'react';
import { Icon } from '../content/icon/icon';
import { Status } from '../content/status/status';
import { Duration } from '../data/duration/duration';

// Derive a literal-union icon name type from lucide's exported icon map so AgentTraceItem callers
// pick from a known list (editor autocompletes, typos fail at compile time).
export type IconName = keyof typeof icons;

export type AgentTraceItemStatus = 'success' | 'error' | 'pending' | 'atomic';

export interface AgentTraceItemProps {
  icon: IconName;
  title: string;
  titleAction?: ReactNode;
  timestamp: number;
  duration?: number;
  status: AgentTraceItemStatus;
  error?: string;
  onClick?: () => void;
  boxed?: boolean;
  tone?: 'default' | 'tool';
  // Optional body content rendered below the summary row. Callers typically pass a `<TraceBodyCell>`
  // (or a fragment containing several) to show request/response payloads; any ReactNode is accepted.
  content?: ReactNode;
}

export function AgentTraceItem(props: AgentTraceItemProps) {
  const statusIconState = props.status === 'success' ? 'success' : props.status === 'error' ? 'failed' : 'in-progress';
  const boxedClassName =
    props.tone === 'tool'
      ? 'flex w-full flex-col gap-2 rounded-md bg-accent/[0.045] px-3 py-2 transition-colors hover:bg-accent/[0.07]'
      : 'flex w-full flex-col gap-2 rounded-md border border-border bg-surface px-3 py-2 transition-colors hover:bg-surface-raised';
  const containerClassName = props.boxed === true ? boxedClassName : 'flex w-full flex-col gap-2 px-3 py-2';
  const summary = (
    <div className="flex w-full items-center gap-2">
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <Icon name={props.icon} className="shrink-0 text-content-muted" />
        <span className="truncate text-sm font-medium text-content capitalize">{props.title}</span>
        {props.titleAction ? <span className="shrink-0">{props.titleAction}</span> : null}
      </div>
      <div className="flex items-center gap-2">
        {props.duration !== undefined && (
          <Duration compact hideInfoIcon start={props.timestamp} end={props.timestamp + props.duration} />
        )}
        {props.status !== 'atomic' && <Status state={statusIconState} variant="icon" />}
      </div>
    </div>
  );

  return (
    <div className={containerClassName}>
      {props.onClick ? (
        <button
          type="button"
          className="w-full cursor-pointer rounded-md text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          onClick={props.onClick}
        >
          {summary}
        </button>
      ) : (
        summary
      )}
      {props.content !== undefined && <div className="flex flex-col gap-1 pl-7">{props.content}</div>}
    </div>
  );
}
