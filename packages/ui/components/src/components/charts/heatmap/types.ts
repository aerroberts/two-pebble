import type { ReactNode } from 'react';

export type HeatmapAxisLabelInput = string | HeatmapAxisLabel;

export interface HeatmapAxisLabel {
  id: string;
  label: ReactNode;
  ariaLabel?: string;
}

export interface HeatmapDatum {
  x: string;
  y: string;
  value: number;
  label?: ReactNode;
  tooltip?: ReactNode;
  color?: string;
  onClick?: (cell: HeatmapDatum, context: HeatmapCellContext) => void;
}

export interface HeatmapCellContext {
  xLabel: HeatmapAxisLabel;
  yLabel: HeatmapAxisLabel;
  maxValue: number;
  minValue: number;
}

export type HeatmapTooltipRenderer = (cell: HeatmapDatum, context: HeatmapCellContext) => ReactNode;

export type HeatmapCellClickHandler = (cell: HeatmapDatum, context: HeatmapCellContext) => void;

export type HeatmapCellColorGetter = (cell: HeatmapDatum, context: HeatmapCellContext) => string;

export interface HeatmapResolvedCell {
  xLabel: HeatmapAxisLabel;
  yLabel: HeatmapAxisLabel;
  datum?: HeatmapDatum;
}

export interface HeatmapProps {
  horizontalLabels: Array<HeatmapAxisLabelInput>;
  verticalLabels: Array<HeatmapAxisLabelInput>;
  data: Array<HeatmapDatum>;
  className?: string;
  cellColor?: string;
  cellSizePx?: number;
  getCellColor?: HeatmapCellColorGetter;
  onCellClick?: HeatmapCellClickHandler;
  renderTooltip?: HeatmapTooltipRenderer;
  emptyCellColor?: string;
  emptyMessage?: string;
}
