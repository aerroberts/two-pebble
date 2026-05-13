import type { ReactNode } from 'react';

export type TableColumnAlignment = 'center' | 'left' | 'right';

export interface TableColumn<TRow> {
  align?: TableColumnAlignment;
  cell: (row: TRow, index: number) => ReactNode;
  header: ReactNode;
  id: string;
  width?: string;
}
