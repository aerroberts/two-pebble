import { useEffect, useRef } from 'react';
import type { CommandPaletteItem } from './command-palette';
import { CommandPaletteResultItem } from './command-palette-result-item';

interface CommandPaletteResultListProps {
  items: CommandPaletteItem[];
  activeIndex: number;
  onSelect: (item: CommandPaletteItem) => void;
  onHover: (index: number) => void;
  emptyState?: string;
}

export function CommandPaletteResultList(props: CommandPaletteResultListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }
    const active = listRef.current.querySelector('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, []);

  if (props.items.length === 0) {
    return (
      <div className="px-3 py-6 text-center text-[12px] text-content-muted">
        {props.emptyState ?? 'No results found.'}
      </div>
    );
  }

  return (
    <div ref={listRef} className="max-h-[320px] overflow-y-auto py-1">
      {props.items.map((item, index) => (
        <CommandPaletteResultItem
          key={item.id}
          item={item}
          active={index === props.activeIndex}
          onSelect={() => props.onSelect(item)}
          onHover={() => props.onHover(index)}
        />
      ))}
    </div>
  );
}
