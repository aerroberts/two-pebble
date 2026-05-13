import type { TimestampFormatter, XTickItem } from './types';

interface LineChartXAxisProps {
  tickItems: Array<XTickItem>;
  timestampFormatter: TimestampFormatter;
}

export function LineChartXAxis(props: LineChartXAxisProps) {
  return (
    <div className="relative h-4">
      {props.tickItems.map((tick) => (
        <div
          key={tick.key}
          className="absolute -translate-x-1/2 text-[10px] leading-none text-content-muted"
          style={{ left: `${tick.leftPercent}%` }}
        >
          {props.timestampFormatter(tick.timestampMs)}
        </div>
      ))}
    </div>
  );
}
