import { Check, Circle, Clock3, X } from 'lucide-react';

import { CHART_COLORS, chartColorToRgba } from '../utils/chart-colors';
import type { TimelineChartStatus } from './types';

interface TimelineStatusMetaProps {
  status: TimelineChartStatus | 'default';
}

export function TimelineStatusMeta(props: TimelineStatusMetaProps) {
  if (props.status === 'success') {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs font-semibold"
        style={{ color: chartColorToRgba(CHART_COLORS.green, 1) }}
      >
        <Check className="w-3.5 h-3.5" strokeWidth={2.75} />
        <span>Success</span>
      </span>
    );
  }

  if (props.status === 'failed') {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs font-semibold"
        style={{ color: chartColorToRgba(CHART_COLORS.red, 1) }}
      >
        <X className="w-3.5 h-3.5" strokeWidth={2.75} />
        <span>Failed</span>
      </span>
    );
  }

  if (props.status === 'in-progress') {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-xs font-semibold"
        style={{ color: chartColorToRgba(CHART_COLORS.amber, 1) }}
      >
        <Clock3 className="w-3.5 h-3.5" strokeWidth={2.75} />
        <span>In Progress</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-70">
      <Circle className="w-2.5 h-2.5" strokeWidth={2.75} style={{ color: chartColorToRgba(CHART_COLORS.slate, 1) }} />
      <span>Pending</span>
    </span>
  );
}
