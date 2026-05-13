import { StackedTimelineBucketColumn } from './stacked-timeline-bucket-column';
import type { BucketRow, StackedTimelineBarChartSeries, TickItem, ValueFormatter } from './types';

interface StackedTimelineBarsProps {
  buckets: Array<BucketRow>;
  chartStartMs: number;
  enabledSeries: Array<StackedTimelineBarChartSeries>;
  paletteBySeries: Map<string, string>;
  tickItems: Array<TickItem>;
  valueFormatter: ValueFormatter;
  yAxisMax: number;
}

export function StackedTimelineBars(props: StackedTimelineBarsProps) {
  return (
    <div className="relative flex-1 overflow-hidden">
      {props.tickItems.slice(1, -1).map((tick) => (
        <div
          key={`grid-${tick.key}`}
          className="absolute inset-x-0 border-t border-border"
          style={{ top: `${tick.topPercent}%` }}
        />
      ))}

      <div className="absolute inset-0 flex items-end gap-1">
        {props.buckets.map((bucket) => (
          <StackedTimelineBucketColumn
            key={bucket.key}
            bucket={bucket}
            chartStartMs={props.chartStartMs}
            enabledSeries={props.enabledSeries}
            paletteBySeries={props.paletteBySeries}
            valueFormatter={props.valueFormatter}
            yAxisMax={props.yAxisMax}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 border-t border-border-strong" />
    </div>
  );
}
