'use client';

import { type KeyboardEvent, useEffect, useRef, useState } from 'react';

import { Icon } from '../../content/icon/icon';
import { CommandPaletteResultList } from './command-palette-result-list';

export interface CommandPaletteItem {
  id: string;
  label: string;
  description?: string;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: CommandPaletteItem) => void;
  items: CommandPaletteItem[];
  placeholder?: string;
  emptyState?: string;
  icon?: string;
}

export function CommandPalette(props: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = props.items.filter((item) => {
    const q = query.toLowerCase();
    return item.label.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
  });

  useEffect(() => {
    if (props.open) {
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [props.open]);

  useEffect(() => {
    setActiveIndex(0);
  }, []);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      props.onClose();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === 'Enter' && filtered[activeIndex]) {
      props.onSelect(filtered[activeIndex]);
    }
  };

  if (!props.open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1000]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onKeyDown={handleKeyDown}
    >
      <button type="button" aria-label="Close" className="fixed inset-0 bg-overlay" onClick={props.onClose} />
      <div className="relative flex justify-center px-4 pt-[120px]">
        <div className="relative z-[1] flex w-full max-w-[520px] flex-col overflow-hidden rounded-md bg-surface-raised shadow-modal">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Icon name={props.icon ?? 'search'} color="text-content-muted" />
            <input
              ref={inputRef}
              className="h-10 w-full bg-transparent text-[13px] font-medium text-content outline-none placeholder:text-content-muted"
              placeholder={props.placeholder ?? 'Search...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd className="shrink-0 rounded-sm border border-border px-1.5 py-0.5 text-[10px] font-medium text-content-muted">
              ESC
            </kbd>
          </div>
          <CommandPaletteResultList
            items={filtered}
            activeIndex={activeIndex}
            onSelect={props.onSelect}
            onHover={setActiveIndex}
            emptyState={props.emptyState}
          />
        </div>
      </div>
    </div>
  );
}
