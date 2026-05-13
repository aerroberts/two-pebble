'use client';

import { CHART_COLORS, chartColorToRgba } from '../utils/chart-colors';
import type { LineChartSeries } from './types';

interface LineChartLegendProps {
  disabledSeries: Set<string>;
  onSeriesToggle: (seriesId: string) => void;
  paletteBySeries: Map<string, string>;
  resolvedSeries: Array<LineChartSeries>;
}

export function LineChartLegend(props: LineChartLegendProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {props.resolvedSeries.map((item) => {
        const isDisabled = props.disabledSeries.has(item.id);
        const backgroundColor = isDisabled
          ? chartColorToRgba(CHART_COLORS.slate, 0.5)
          : props.paletteBySeries.get(item.id);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => props.onSeriesToggle(item.id)}
            className={`flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs transition-colors ${
              isDisabled ? 'text-content-muted opacity-50' : 'text-content hover:bg-surface-hover'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor }} />
            <span className={isDisabled ? 'line-through' : undefined}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
