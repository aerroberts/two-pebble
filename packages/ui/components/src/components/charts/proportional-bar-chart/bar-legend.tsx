import { resolveColor } from '../utils/resolve-color';
import type { ProportionalBarChartItem } from './proportional-bar-chart';

interface BarLegendProps {
  items: Array<ProportionalBarChartItem>;
  total: number;
  valueFormatter?: (value: number) => string;
}

export function BarLegend(props: BarLegendProps) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
      {props.items.map((item) => {
        const pct = ((item.value / props.total) * 100).toFixed(1);
        const resolved = resolveColor(item.color);
        return (
          <div key={item.label} className="flex items-center gap-1.5 text-xs">
            <div
              className={`h-1.5 w-1.5 shrink-0 rounded-none ${resolved.tailwind ?? ''}`}
              style={resolved.hex ? { backgroundColor: resolved.hex } : undefined}
            />
            <span className="text-content">{item.label}</span>
            {props.valueFormatter ? (
              <span className="text-content-muted">{props.valueFormatter(item.value)}</span>
            ) : null}
            <span className="text-content-muted">({pct}%)</span>
          </div>
        );
      })}
    </div>
  );
}
