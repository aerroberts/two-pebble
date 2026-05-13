'use client';

import { useMemo, useState } from 'react';

import { StackedTimelineBars } from './stacked-timeline-bars';
import { StackedTimelineLegend } from './stacked-timeline-legend';
import { StackedTimelineXAxis } from './stacked-timeline-x-axis';
import { StackedTimelineYAxis } from './stacked-timeline-y-axis';
import type { StackedTimelineBarChartProps } from './types';
import { buildChartState, buildDisplayBuckets, defaultValueFormatter, getTickItems } from './utils';

export type {
  BucketRow,
  ChartState,
  ChartTimestamp,
  StackedTimelineBarChartPoint,
  StackedTimelineBarChartProps,
  StackedTimelineBarChartSeries,
  TickItem,
  TooltipRow,
  ValueFormatter,
} from './types';

export function StackedTimelineBarChart(props: StackedTimelineBarChartProps) {
  const [disabledSeries, setDisabledSeries] = useState<Set<string>>(new Set());
  const chartState = useMemo(
    () =>
      buildChartState({
        bucketCount: props.bucketCount,
        endTime: props.endTime,
        points: props.points,
        series: props.series,
        startTime: props.startTime,
      }),
    [props.bucketCount, props.endTime, props.points, props.series, props.startTime],
  );
  const valueFormatter = props.valueFormatter ?? defaultValueFormatter;
  const yAxisWidth = props.yAxisWidth ?? 80;
  const enabledSeries = useMemo(
    () => chartState.resolvedSeries.filter((item) => !disabledSeries.has(item.id)),
    [chartState.resolvedSeries, disabledSeries],
  );
  const displayBuckets = useMemo(
    () => buildDisplayBuckets(chartState.buckets, enabledSeries),
    [chartState.buckets, enabledSeries],
  );
  const tickItems = useMemo(
    () => getTickItems(chartState.yAxisMax, props.yAxisTickCount ?? 4),
    [chartState.yAxisMax, props.yAxisTickCount],
  );

  if (props.points.length === 0 || chartState.resolvedSeries.length === 0) {
    return <p className="text-xs text-content-muted">{props.emptyMessage ?? 'No data available'}</p>;
  }

  return (
    <div className={`space-y-5 ${props.className ?? ''}`}>
      <div className="w-full">
        <div className="flex w-full gap-3" style={{ height: props.height ?? 260 }}>
          <StackedTimelineYAxis tickItems={tickItems} valueFormatter={valueFormatter} width={yAxisWidth} />

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <StackedTimelineBars
              buckets={displayBuckets}
              chartStartMs={chartState.chartStartMs}
              enabledSeries={enabledSeries}
              paletteBySeries={chartState.paletteBySeries}
              tickItems={tickItems}
              valueFormatter={valueFormatter}
              yAxisMax={chartState.yAxisMax}
            />
            <StackedTimelineXAxis buckets={displayBuckets} chartStartMs={chartState.chartStartMs} />
          </div>
        </div>
      </div>

      <div className="flex w-full gap-3">
        <div className="shrink-0" style={{ width: yAxisWidth }} />
        <StackedTimelineLegend
          disabledSeries={disabledSeries}
          onSeriesToggle={(seriesId) =>
            setDisabledSeries((previous) => {
              const next = new Set(previous);
              if (next.has(seriesId)) {
                next.delete(seriesId);
              } else {
                next.add(seriesId);
              }

              return next;
            })
          }
          paletteBySeries={chartState.paletteBySeries}
          resolvedSeries={chartState.resolvedSeries}
        />
      </div>
    </div>
  );
}
