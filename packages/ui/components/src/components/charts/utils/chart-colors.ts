export const CHART_COLORS = {
  blue: 'var(--color-chart-1)',
  green: 'var(--color-chart-2)',
  amber: 'var(--color-chart-3)',
  orange: 'var(--color-chart-4)',
  purple: 'var(--color-chart-5)',
  cyan: 'var(--color-chart-6)',
  indigo: 'var(--color-chart-7)',
  slate: 'var(--color-chart-8)',
  red: 'var(--color-danger)',
} as const;

export type ChartColorName = keyof typeof CHART_COLORS;

export const CHART_PALETTE = [
  CHART_COLORS.blue,
  CHART_COLORS.green,
  CHART_COLORS.amber,
  CHART_COLORS.orange,
  CHART_COLORS.purple,
  CHART_COLORS.cyan,
  CHART_COLORS.indigo,
  CHART_COLORS.slate,
];

export const CHART_SERIES_ALPHA = 1;

export function chartSeriesColor(color: string): string {
  return chartColorToRgba(color, CHART_SERIES_ALPHA);
}

export function chartPaletteColor(index: number): string {
  return chartSeriesColor(CHART_PALETTE[index % CHART_PALETTE.length]);
}

export function chartColorToRgba(hex: string, alpha = 0.2): string {
  if (!hex.startsWith('#')) {
    return alpha >= 1 ? hex : `color-mix(in srgb, ${hex} ${Math.round(alpha * 100)}%, transparent)`;
  }

  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export const CHART_DEFAULT_NODE_COLOR = CHART_COLORS.slate;
export const CHART_DEFAULT_LINK_COLOR = chartColorToRgba(CHART_DEFAULT_NODE_COLOR, 0.2);
