'use client';

import { Info } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Tooltip } from '../../providers/tooltip/tooltip-trigger';
import { formatRelativeTime, getValidDate } from './relative-time-utils';

export interface RelativeTimeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'className'> {
  date: Date | number | string | null | undefined;
  silent?: boolean;
}

export function RelativeTime(props: RelativeTimeProps) {
  const { date, silent = false, ...timeProps } = props;
  const [now, setNow] = useState(() => Date.now());
  const parsedDate = useMemo(() => getValidDate(date), [date]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  if (date === null || typeof date === 'undefined') {
    return (
      <span className="inline-flex rounded-md px-2 py-1 text-xs text-content-muted" {...timeProps}>
        —
      </span>
    );
  }

  if (!parsedDate) {
    return (
      <span className="inline-flex rounded-md px-2 py-1 text-xs text-content-muted" {...timeProps}>
        Invalid date
      </span>
    );
  }

  const absoluteValue = parsedDate.toLocaleString('en-US', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const relativeValue = formatRelativeTime(parsedDate.getTime(), now);
  const className = silent
    ? 'inline-flex items-center rounded-md px-1.5 py-0.5 text-sm text-content'
    : 'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-sm text-content transition-colors hover:bg-accent/[0.08]';

  if (silent) {
    return (
      <span className={className} {...timeProps}>
        {relativeValue}
      </span>
    );
  }

  return (
    <Tooltip data={{ Date: absoluteValue, Relative: relativeValue }}>
      <span className={className} {...timeProps}>
        {relativeValue}
        <Info className="size-3 shrink-0 text-content-muted" aria-hidden="true" />
      </span>
    </Tooltip>
  );
}
