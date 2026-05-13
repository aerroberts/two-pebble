import type { TooltipData } from '../../providers/tooltip/tooltip-trigger';
import { TimelineStatusMeta } from './timeline-status-meta';
import { formatDuration, formatMetricLabel } from './timeline-utils';
import type { PlacedItem } from './types';

interface TimelineBarTooltipProps {
  entry: PlacedItem;
}

export function getTimelineBarTooltip(props: TimelineBarTooltipProps): { header: string; data: TooltipData } {
  const { entry } = props;
  const durationMs = entry.endMs - entry.startMs;
  const status = entry.item.status ?? 'default';
  const category = entry.item.category ?? entry.item.label;

  const data = {
    Category: category,
    Duration: formatDuration(durationMs),
    Status: <TimelineStatusMeta status={status} />,
    ...Object.fromEntries(
      (entry.item.metrics ?? []).map((metric) => [formatMetricLabel(metric.label), String(metric.value)]),
    ),
  };

  return { header: entry.item.label, data };
}
