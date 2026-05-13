import type { ReactNode } from 'react';

import { renderBodyRow, renderHeaderCell } from './render-helpers';
import type { TableColumn } from './types';

export type { TableColumn };

export interface TableProps<TRow> {
  columns: TableColumn<TRow>[];
  rows: TRow[];
  getRowKey?: (row: TRow, index: number) => string | number;
  onRowClick?: (row: TRow, index: number) => void;
  emptyMessage?: ReactNode;
}

export function Table<TRow>(props: TableProps<TRow>) {
  const headerCells = props.columns.map((col) => renderHeaderCell(col));
  const bodyRows = props.rows.map((row, index) =>
    renderBodyRow({ columns: props.columns, row, index, getRowKey: props.getRowKey, onRowClick: props.onRowClick }),
  );
  const emptyRow =
    props.rows.length === 0 ? (
      <tr>
        <td className="px-4 py-8 text-center text-sm text-content-muted" colSpan={props.columns.length}>
          {props.emptyMessage ?? 'No rows available.'}
        </td>
      </tr>
    ) : null;

  return (
    <div className="w-full overflow-hidden rounded-sm bg-surface">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>{headerCells}</tr>
          </thead>
          <tbody>{bodyRows.length > 0 ? bodyRows : emptyRow}</tbody>
        </table>
      </div>
    </div>
  );
}
