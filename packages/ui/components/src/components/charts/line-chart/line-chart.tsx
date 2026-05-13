'use client';

import { useMemo, useState } from 'react';

import { LineChartLegend } from './line-chart-legend';
import { LineChartPaths } from './line-chart-paths';
import { LineChartXAxis } from './line-chart-x-axis';
import { LineChartYAxis } from './line-chart-y-axis';
import type { LineChartProps } from './types';
import {
  buildChartState,
  defaultTimestampFormatter,
  defaultValueFormatter,
  getXTickItems,
  getYTickItems,
} from './utils';

export type {
  ChartState,
  ChartTimestamp,
  LineChartPoint,
  LineChartProps,
  LineChartSeries,
  TickItem,
  TimestampFormatter,
  ValueFormatter,
  XTickItem,
} from './types';

const PLOT_VIEWBOX_WIDTH = 1000;
const PLOT_VIEWBOX_HEIGHT = 400;

export function LineChart(props: LineChartProps) {
  const [disabledSeries, setDisabledSeries] = useState<Set<string>>(new Set());
  const chartState = useMemo(
    () =>
      buildChartState({
        endTime: props.endTime,
        points: props.points,
        series: props.series,
        startTime: props.startTime,
      }),
    [props.endTime, props.points, props.series, props.startTime],
  );

  const valueFormatter = props.valueFormatter ?? defaultValueFormatter;
  const timestampFormatter = props.timestampFormatter ?? defaultTimestampFormatter;
  const yAxisWidth = props.yAxisWidth ?? 56;
  const showLegend = props.showLegend ?? true;
  const showDots = props.showDots ?? false;
  const filledArea = props.filledArea ?? false;
  const yTickItems = useMemo(
    () => getYTickItems(chartState.yAxisMin, chartState.yAxisMax, props.yAxisTickCount ?? 4),
    [chartState.yAxisMin, chartState.yAxisMax, props.yAxisTickCount],
  );
  const xTickItems = useMemo(
    () => getXTickItems(chartState.chartStartMs, chartState.chartEndMs, props.xAxisTickCount ?? 5),
    [chartState.chartStartMs, chartState.chartEndMs, props.xAxisTickCount],
  );
  const enabledSeriesIds = useMemo(
    () => new Set(chartState.resolvedSeries.filter((s) => !disabledSeries.has(s.id)).map((s) => s.id)),
    [chartState.resolvedSeries, disabledSeries],
  );

  if (props.points.length === 0 || chartState.resolvedSeries.length === 0) {
    return <p className="text-xs text-content-muted">{props.emptyMessage ?? 'No data available'}</p>;
  }

  return (
    <div className={`space-y-5 ${props.className ?? ''}`}>
      <div className="w-full">
        <div className="flex w-full gap-3" style={{ height: props.height ?? 260 }}>
          <LineChartYAxis tickItems={yTickItems} valueFormatter={valueFormatter} width={yAxisWidth} />

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="relative min-h-0 flex-1">
              <LineChartPaths
                chartState={chartState}
                enabledSeriesIds={enabledSeriesIds}
                filledArea={filledArea}
                showDots={showDots}
                tickItems={yTickItems}
                width={PLOT_VIEWBOX_WIDTH}
                height={PLOT_VIEWBOX_HEIGHT}
              />
            </div>
            <LineChartXAxis tickItems={xTickItems} timestampFormatter={timestampFormatter} />
          </div>
        </div>
      </div>

      {showLegend ? (
        <div className="flex w-full gap-3">
          <div className="shrink-0" style={{ width: yAxisWidth }} />
          <LineChartLegend
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
      ) : null}
    </div>
  );
}
