import { CHART_COLORS, type ChartColorName, chartSeriesColor } from './chart-colors';

export interface ResolvedColor {
  hex?: string;
  tailwind?: string;
}

export function resolveColor(color: string): ResolvedColor {
  if (color in CHART_COLORS) {
    return { hex: chartSeriesColor(CHART_COLORS[color as ChartColorName]) };
  }
  if (color.startsWith('#') || color.startsWith('var(') || color.startsWith('color-mix(')) {
    return { hex: color };
  }
  return { tailwind: color };
}
