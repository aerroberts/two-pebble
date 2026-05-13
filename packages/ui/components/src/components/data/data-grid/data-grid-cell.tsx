'use client';

import type { ReactNode } from 'react';

import { CopyableValue } from '../copyable-value/copyable-value';
import { EditableCell } from './editable-cell';

export interface DataGridCellProps {
  isEditable: boolean;
  label: string;
  onEdit?: (newValue: string) => void;
  value: ReactNode;
}

export function DataGridCell(props: DataGridCellProps) {
  const { isEditable, label, onEdit, value } = props;

  if (isEditable && onEdit) {
    const editableValue = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
    return <EditableCell label={label} editableValue={editableValue} onEdit={onEdit} />;
  }

  const valueNode =
    value === null || typeof value === 'undefined' ? (
      <div className="text-sm leading-6 text-content-muted">—</div>
    ) : typeof value === 'string' || typeof value === 'number' ? (
      <CopyableValue value={String(value)} />
    ) : (
      <div className="w-full min-w-0 text-sm leading-6 text-content">{value}</div>
    );

  return (
    <div className="flex h-full flex-col">
      <div className="text-[11px] font-normal uppercase tracking-[0.08em] text-content-muted">{label}</div>
      <div className="mt-3 flex flex-1 items-start">{valueNode}</div>
    </div>
  );
}
