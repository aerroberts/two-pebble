'use client';

import { Tooltip } from '../../providers/tooltip/tooltip-trigger';
import { StackedTimelineBarSegment } from './stacked-timeline-bar-segment';
import { getStackedTimelineBucketTooltipData } from './stacked-timeline-bucket-tooltip';
import type { BucketRow, StackedTimelineBarChartSeries, ValueFormatter } from './types';

interface StackedTimelineBucketColumnProps {
  bucket: BucketRow;
  chartStartMs: number;
  enabledSeries: Array<StackedTimelineBarChartSeries>;
  paletteBySeries: Map<string, string>;
  valueFormatter: ValueFormatter;
  yAxisMax: number;
}

export function StackedTimelineBucketColumn(props: StackedTimelineBucketColumnProps) {
  const barHeight = `${Math.max((props.bucket.total / props.yAxisMax) * 100, props.bucket.total > 0 ? 2 : 0)}%`;
  const tooltipData = getStackedTimelineBucketTooltipData({
    bucket: props.bucket,
    chartStartMs: props.chartStartMs,
    enabledSeries: props.enabledSeries,
    valueFormatter: props.valueFormatter,
  });

  return (
    <div className="flex h-full min-w-0 flex-1 items-end">
      <Tooltip compact data={tooltipData} side="top">
        <div
          className="flex w-full flex-col-reverse overflow-hidden rounded-sm bg-surface-hover"
          style={{ height: barHeight }}
        >
          {props.enabledSeries.map((item) => (
            <StackedTimelineBarSegment
              key={`${props.bucket.key}-${item.id}`}
              bucketTotal={props.bucket.total}
              color={props.paletteBySeries.get(item.id)}
              segmentKey={`${props.bucket.key}-${item.id}`}
              value={props.bucket.bySeries[item.id] ?? 0}
            />
          ))}
        </div>
      </Tooltip>
    </div>
  );
}
