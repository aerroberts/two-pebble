'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';

import { Tooltip, type TooltipData } from '../../providers/tooltip/tooltip-trigger';
import { DEFAULT_CELL_COLOR, DEFAULT_CELL_SIZE_PX, DEFAULT_EMPTY_CELL_COLOR } from './constants';
import type {
  HeatmapAxisLabel,
  HeatmapAxisLabelInput,
  HeatmapCellContext,
  HeatmapDatum,
  HeatmapProps,
  HeatmapResolvedCell,
} from './types';

export type {
  HeatmapAxisLabel,
  HeatmapAxisLabelInput,
  HeatmapCellClickHandler,
  HeatmapCellColorGetter,
  HeatmapCellContext,
  HeatmapDatum,
  HeatmapProps,
  HeatmapResolvedCell,
  HeatmapTooltipRenderer,
} from './types';

export function Heatmap(props: HeatmapProps) {
  const className = ['w-full min-w-0 overflow-hidden', props.className].filter(Boolean).join(' ');
  const emptyCellColor = props.emptyCellColor ?? DEFAULT_EMPTY_CELL_COLOR;
  const cellColor = props.cellColor ?? DEFAULT_CELL_COLOR;
  const cellSizePx = Math.max(1, props.cellSizePx ?? DEFAULT_CELL_SIZE_PX);
  const emptyMessage = props.emptyMessage ?? 'No heatmap data';

  const horizontalLabels = useMemo(() => normalizeLabels(props.horizontalLabels), [props.horizontalLabels]);
  const verticalLabels = useMemo(() => normalizeLabels(props.verticalLabels), [props.verticalLabels]);
  const valueRange = useMemo(() => getValueRange(props.data), [props.data]);
  const dataByKey = useMemo(() => {
    const map = new Map<string, HeatmapDatum>();
    for (const cell of props.data) map.set(getCellKey(cell.x, cell.y), cell);
    return map;
  }, [props.data]);
  const rows = useMemo(
    () =>
      verticalLabels.map((yLabel) =>
        horizontalLabels.map<HeatmapResolvedCell>((xLabel) => ({
          xLabel,
          yLabel,
          datum: dataByKey.get(getCellKey(xLabel.id, yLabel.id)),
        })),
      ),
    [dataByKey, horizontalLabels, verticalLabels],
  );

  if (horizontalLabels.length === 0 || verticalLabels.length === 0 || props.data.length === 0) {
    return (
      <div className={className}>
        <div className="text-xs text-content-muted">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className="grid max-w-full min-w-0 items-center overflow-hidden"
        style={{
          gridTemplateColumns: `max-content repeat(${horizontalLabels.length}, ${cellSizePx}px)`,
        }}
      >
        <div />
        {horizontalLabels.map((label) => (
          <AxisHeader key={label.id} label={label} cellSizePx={cellSizePx} />
        ))}
        {rows.map((row) => (
          <HeatmapRow
            key={row[0]?.yLabel.id}
            row={row}
            cellColor={cellColor}
            cellSizePx={cellSizePx}
            emptyCellColor={emptyCellColor}
            getCellColor={props.getCellColor}
            maxValue={valueRange.maxValue}
            minValue={valueRange.minValue}
            onCellClick={props.onCellClick}
            renderTooltip={props.renderTooltip}
          />
        ))}
      </div>
    </div>
  );
}

interface HeatmapRowProps {
  row: Array<HeatmapResolvedCell>;
  cellColor: string;
  cellSizePx: number;
  emptyCellColor: string;
  maxValue: number;
  minValue: number;
  getCellColor?: HeatmapProps['getCellColor'];
  onCellClick?: HeatmapProps['onCellClick'];
  renderTooltip?: HeatmapProps['renderTooltip'];
}

function HeatmapRow(props: HeatmapRowProps) {
  const yLabel = props.row[0]?.yLabel;
  if (!yLabel) return null;

  return (
    <>
      <div className="pr-2 text-right text-xs text-content-muted" title={yLabel.ariaLabel}>
        {yLabel.label}
      </div>
      {props.row.map((cell) => (
        <HeatmapCell
          key={`${cell.xLabel.id}:${cell.yLabel.id}`}
          cell={cell}
          cellColor={props.cellColor}
          cellSizePx={props.cellSizePx}
          emptyCellColor={props.emptyCellColor}
          getCellColor={props.getCellColor}
          maxValue={props.maxValue}
          minValue={props.minValue}
          onCellClick={props.onCellClick}
          renderTooltip={props.renderTooltip}
        />
      ))}
    </>
  );
}

interface HeatmapCellProps {
  cell: HeatmapResolvedCell;
  cellColor: string;
  cellSizePx: number;
  emptyCellColor: string;
  maxValue: number;
  minValue: number;
  getCellColor?: HeatmapProps['getCellColor'];
  onCellClick?: HeatmapProps['onCellClick'];
  renderTooltip?: HeatmapProps['renderTooltip'];
}

function HeatmapCell(props: HeatmapCellProps) {
  const datum = props.cell.datum;
  const context: HeatmapCellContext = {
    xLabel: props.cell.xLabel,
    yLabel: props.cell.yLabel,
    maxValue: props.maxValue,
    minValue: props.minValue,
  };
  const hasClick = !!datum && (!!props.onCellClick || !!datum.onClick);
  const backgroundColor = datum
    ? resolveCellColor(datum, context, props.cellColor, props.emptyCellColor, props.getCellColor)
    : props.emptyCellColor;
  const style = {
    width: '100%',
    height: props.cellSizePx,
    backgroundColor,
  };
  const ariaLabel = getCellAriaLabel(props.cell, datum);
  const handleClick = datum
    ? () => {
        datum.onClick?.(datum, context);
        props.onCellClick?.(datum, context);
      }
    : undefined;
  const cell = hasClick ? (
    <button
      type="button"
      aria-label={ariaLabel}
      className="block appearance-none rounded-none border-0 p-0 outline-none hover:brightness-105 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
      onClick={handleClick}
      style={style}
    />
  ) : (
    <div aria-label={ariaLabel} className="rounded-none" role="img" style={style} />
  );
  const tooltip = datum ? getTooltipProps(datum, context, props.renderTooltip) : undefined;

  if (!datum || !tooltip) return cell;

  return (
    <Tooltip content={tooltip.content} data={tooltip.data} header={tooltip.header}>
      {cell}
    </Tooltip>
  );
}

function AxisHeader(props: { label: HeatmapAxisLabel; cellSizePx: number }) {
  return (
    <div
      className="flex min-w-0 items-end justify-center overflow-hidden pb-1 text-[10px] text-content-muted"
      style={{ width: '100%', height: props.cellSizePx + 18 }}
      title={props.label.ariaLabel}
    >
      <span className="-rotate-45 whitespace-nowrap">{props.label.label}</span>
    </div>
  );
}

function normalizeLabels(labels: Array<HeatmapAxisLabelInput>): Array<HeatmapAxisLabel> {
  return labels.map((label) => (typeof label === 'string' ? { id: label, label } : label));
}

function getCellKey(x: string, y: string) {
  return `${x}::${y}`;
}

function getValueRange(data: Array<HeatmapDatum>) {
  if (data.length === 0) return { minValue: 0, maxValue: 0 };
  let minValue = data[0]?.value ?? 0;
  let maxValue = data[0]?.value ?? 0;
  for (const cell of data) {
    minValue = Math.min(minValue, cell.value);
    maxValue = Math.max(maxValue, cell.value);
  }
  return { minValue, maxValue };
}

function resolveCellColor(
  datum: HeatmapDatum,
  context: HeatmapCellContext,
  cellColor: string,
  emptyCellColor: string,
  getCellColor?: HeatmapProps['getCellColor'],
) {
  if (datum.color) return datum.color;
  if (getCellColor) return getCellColor(datum, context);
  const range = context.maxValue - context.minValue;
  const ratio = range > 0 ? (datum.value - context.minValue) / range : datum.value > 0 ? 1 : 0;
  const colorWeight = Math.round(12 + clamp(ratio, 0, 1) * 88);
  return `color-mix(in srgb, ${cellColor} ${colorWeight}%, ${emptyCellColor})`;
}

interface HeatmapTooltipProps {
  content?: ReactNode;
  data?: TooltipData;
  header?: ReactNode;
}

function getTooltipProps(
  datum: HeatmapDatum,
  context: HeatmapCellContext,
  renderTooltip?: HeatmapProps['renderTooltip'],
) {
  if (renderTooltip) {
    const content = renderTooltip(datum, context);
    return content === undefined || content === null || content === false ? undefined : { content };
  }

  if (datum.tooltip !== undefined) {
    return datum.tooltip === null || datum.tooltip === false ? undefined : { content: datum.tooltip };
  }

  return {
    data: {
      Column: getAxisLabelText(context.xLabel),
      Row: getAxisLabelText(context.yLabel),
      Value: datum.value,
    },
    header: datum.label ?? `${getAxisLabelText(context.yLabel)} / ${getAxisLabelText(context.xLabel)}`,
  } satisfies HeatmapTooltipProps;
}

function getCellAriaLabel(cell: HeatmapResolvedCell, datum?: HeatmapDatum) {
  const label = getDatumLabelText(datum);
  const value = datum ? datum.value : 'empty';
  const prefix = label ? `${label}: ` : '';
  return `${prefix}${cell.yLabel.ariaLabel ?? getAxisLabelText(cell.yLabel)}, ${
    cell.xLabel.ariaLabel ?? getAxisLabelText(cell.xLabel)
  }, ${value}`;
}

function getAxisLabelText(label: HeatmapAxisLabel) {
  if (typeof label.label === 'string' || typeof label.label === 'number') return String(label.label);
  return label.ariaLabel ?? label.id;
}

function getDatumLabelText(datum?: HeatmapDatum) {
  if (!datum) return '';
  if (typeof datum.label === 'string' || typeof datum.label === 'number') return String(datum.label);
  return '';
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
