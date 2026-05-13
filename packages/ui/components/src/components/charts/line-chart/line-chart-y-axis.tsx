import type { TickItem, ValueFormatter } from './types';

interface LineChartYAxisProps {
  tickItems: Array<TickItem>;
  valueFormatter: ValueFormatter;
  width: number;
}

export function LineChartYAxis(props: LineChartYAxisProps) {
  return (
    <div className="relative shrink-0" style={{ width: props.width }}>
      {props.tickItems.map((tick) => (
        <div key={tick.key} className="absolute right-0 -translate-y-1/2" style={{ top: `${tick.topPercent}%` }}>
          <span className="inline-block text-[10px] leading-none text-content-muted">
            {props.valueFormatter(tick.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
