'use client';

import { BarLegend } from './bar-legend';
import { BarSegment } from './bar-segment';

export interface ProportionalBarChartItem {
  label: string;
  value: number;
  color: string;
}

export interface ProportionalBarChartProps {
  items: Array<ProportionalBarChartItem>;
  showLegend?: boolean;
  height?: number;
  valueFormatter?: (value: number) => string;
}

export function ProportionalBarChart(props: ProportionalBarChartProps) {
  const showLegend = props.showLegend ?? true;
  const height = props.height ?? 8;
  const total = props.items.reduce((sum, i) => sum + i.value, 0);
  if (total === 0) return null;

  return (
    <div className="w-full">
      <ul
        className="flex w-full list-none overflow-hidden rounded-none bg-surface-alt p-0"
        aria-label="Proportional bar chart"
        style={{ height }}
      >
        {props.items.map((item) => {
          const pct = (item.value / total) * 100;
          return (
            <BarSegment
              key={item.label}
              label={item.label}
              value={item.value}
              valueFormatter={props.valueFormatter}
              pct={pct.toFixed(1)}
              widthPct={pct}
              color={item.color}
            />
          );
        })}
      </ul>
      {showLegend ? <BarLegend items={props.items} total={total} valueFormatter={props.valueFormatter} /> : null}
    </div>
  );
}
