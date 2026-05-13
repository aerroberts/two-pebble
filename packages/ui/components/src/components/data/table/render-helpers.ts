import { createElement } from 'react';

import type { TableColumn, TableColumnAlignment } from './types';

interface BodyRowInput<TRow> {
  columns: TableColumn<TRow>[];
  row: TRow;
  index: number;
  getRowKey?: (row: TRow, index: number) => string | number;
  onRowClick?: (row: TRow, index: number) => void;
}

function getAlignmentClassName(alignment: TableColumnAlignment = 'left') {
  if (alignment === 'center') {
    return 'text-center';
  }
  if (alignment === 'right') {
    return 'text-right';
  }
  return 'text-left';
}

export function renderHeaderCell<TRow>(column: TableColumn<TRow>) {
  const className = `px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-accent ${getAlignmentClassName(column.align)}`;
  return createElement(
    'th',
    { key: column.id, className, scope: 'col', style: column.width ? { width: column.width } : undefined },
    column.header,
  );
}

export function renderBodyRow<TRow>(input: BodyRowInput<TRow>) {
  const rowKey = input.getRowKey ? input.getRowKey(input.row, input.index) : input.index;
  const cells = input.columns.map((col) => {
    const className = `px-4 py-3 text-sm leading-6 text-content ${getAlignmentClassName(col.align)}`;
    return createElement('td', { key: col.id, className }, col.cell(input.row, input.index));
  });
  const clickable = input.onRowClick != null;
  const rowClassName = `transition-colors hover:bg-surface-hover ${clickable ? 'cursor-pointer' : ''}`;
  return createElement(
    'tr',
    {
      key: rowKey,
      className: rowClassName,
      onClick: clickable ? () => input.onRowClick?.(input.row, input.index) : undefined,
    },
    ...cells,
  );
}
