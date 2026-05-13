'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { DataGridCell } from './data-grid-cell';

export interface DataGridProps {
  columns?: 1 | 2 | 3 | 4;
  data: Record<string, ReactNode>;
  editable?: string[];
  onEdit?: (newData: Record<string, ReactNode>) => void;
}

export function DataGrid(props: DataGridProps) {
  const { columns = 2, data, editable, onEdit } = props;
  const [localData, setLocalData] = useState(data);
  const activeData = onEdit ? localData : data;
  const entries = Object.entries(activeData);
  const editableKeys = editable ?? (onEdit ? Object.keys(activeData) : []);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  function handleEdit(label: string, newValue: string) {
    if (!onEdit) {
      return;
    }
    const nextData = { ...localData, [label]: newValue };
    setLocalData(nextData);
    onEdit(nextData);
  }

  const gridStyle = { display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` };
  const remainder = entries.length % columns;
  const emptyCount = remainder === 0 ? 0 : columns - remainder;
  const emptyCellKeys = Array.from({ length: emptyCount }, (_, index) => `empty-col-${entries.length + index}`);

  return (
    <div className="w-full overflow-hidden rounded-sm bg-surface">
      <div style={gridStyle}>
        {entries.map(([label, value]) => {
          return (
            <div key={label} className="p-4">
              <DataGridCell
                isEditable={editableKeys.includes(label)}
                label={label}
                value={value}
                onEdit={onEdit ? (nv) => handleEdit(label, nv) : undefined}
              />
            </div>
          );
        })}
        {emptyCellKeys.map((key) => (
          <div key={key} className="p-4" />
        ))}
      </div>
    </div>
  );
}
