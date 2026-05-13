'use client';

import { Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface EditableCellProps {
  label: string;
  editableValue: string;
  onEdit: (newValue: string) => void;
}

export function EditableCell(props: EditableCellProps) {
  const { label, editableValue, onEdit } = props;
  const [draftValue, setDraftValue] = useState(editableValue);

  useEffect(() => {
    setDraftValue(editableValue);
  }, [editableValue]);

  const saveDraft = () => onEdit(draftValue);
  const resetDraft = () => setDraftValue(editableValue);
  const handleKeyDown = (eventKey: string) =>
    eventKey === 'Enter' ? saveDraft() : eventKey === 'Escape' ? resetDraft() : undefined;

  return (
    <div className="flex h-full flex-col">
      <div className="text-[11px] font-normal uppercase tracking-[0.08em] text-content-muted">{label}</div>
      <div className="mt-3 flex flex-1 items-start">
        <label className="flex w-full items-center gap-2">
          <input
            className="w-full bg-transparent text-sm leading-6 text-content outline-none"
            type="text"
            value={draftValue}
            onBlur={saveDraft}
            onChange={(event) => setDraftValue(event.target.value)}
            onKeyDown={(event) => handleKeyDown(event.key)}
          />
          <Pencil size={14} className="shrink-0 text-content-muted" />
        </label>
      </div>
    </div>
  );
}
