import { CHART_COLORS } from '../utils/chart-colors';
import type { NormalizedItem } from './types';

interface TimelineLegendProps {
  categories: Array<string>;
  colorMap: Map<string, string>;
  disabledCategories: Set<string>;
  normalizedItems: Array<NormalizedItem>;
  onToggle: (category: string) => void;
}

export function TimelineLegend(props: TimelineLegendProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {props.categories.map((category) => {
        const disabled = props.disabledCategories.has(category);
        const count = props.normalizedItems.filter(
          (entry) => (entry.item.category ?? entry.item.label) === category,
        ).length;
        const toneClass = disabled
          ? 'opacity-40 hover:opacity-60 text-content-muted'
          : 'opacity-100 hover:bg-surface-hover text-content';
        return (
          <button
            key={category}
            type="button"
            onClick={() => props.onToggle(category)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all border border-border ${toneClass}`}
          >
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: props.colorMap.get(category) ?? CHART_COLORS.blue }}
            />
            <span className={disabled ? 'line-through' : ''}>{category}</span>
            <span className="text-content-muted">({count})</span>
          </button>
        );
      })}
    </div>
  );
}
