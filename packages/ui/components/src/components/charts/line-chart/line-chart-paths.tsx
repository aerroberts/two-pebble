import type { ChartState, TickItem } from './types';
import { buildAreaPath, buildSvgPath } from './utils';

interface LineChartPathsProps {
  chartState: ChartState;
  enabledSeriesIds: Set<string>;
  filledArea: boolean;
  showDots: boolean;
  tickItems: Array<TickItem>;
  width: number;
  height: number;
}

export function LineChartPaths(props: LineChartPathsProps) {
  const { chartState, width, height } = props;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="block h-full w-full">
      {props.tickItems.map((tick) => {
        const y = (tick.topPercent / 100) * height;
        return (
          <line
            key={`grid-${tick.key}`}
            x1={0}
            x2={width}
            y1={y}
            y2={y}
            stroke="currentColor"
            strokeWidth={0.5}
            className="text-content-faint opacity-30"
          />
        );
      })}
      {chartState.resolvedSeries.map((series) => {
        if (!props.enabledSeriesIds.has(series.id)) return null;
        const points = chartState.pointsBySeries.get(series.id) ?? [];
        if (points.length === 0) return null;
        const color = chartState.paletteBySeries.get(series.id) ?? 'currentColor';
        const linePath = buildSvgPath(
          points,
          chartState.chartStartMs,
          chartState.chartEndMs,
          chartState.yAxisMin,
          chartState.yAxisMax,
          width,
          height,
        );
        return (
          <g key={series.id}>
            {props.filledArea ? (
              <path
                d={buildAreaPath(
                  points,
                  chartState.chartStartMs,
                  chartState.chartEndMs,
                  chartState.yAxisMin,
                  chartState.yAxisMax,
                  width,
                  height,
                )}
                fill={color}
                fillOpacity={0.15}
              />
            ) : null}
            <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} />
            {props.showDots
              ? points.map((point, index) => {
                  const xRange = Math.max(1, chartState.chartEndMs - chartState.chartStartMs);
                  const yRange = Math.max(Number.MIN_VALUE, chartState.yAxisMax - chartState.yAxisMin);
                  const cx = ((point.x - chartState.chartStartMs) / xRange) * width;
                  const cy = (1 - (point.y - chartState.yAxisMin) / yRange) * height;
                  return <circle key={`${series.id}-${index}`} cx={cx} cy={cy} r={2} fill={color} />;
                })
              : null}
          </g>
        );
      })}
    </svg>
  );
}
