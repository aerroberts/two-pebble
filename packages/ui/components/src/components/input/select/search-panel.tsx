import type { LegacyRef, RefObject } from 'react';

import { Icon } from '../../content/icon/icon';

export interface SearchPanelProps {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function SearchPanel(props: SearchPanelProps) {
  return (
    <div className="flex h-7 items-center gap-1.5 border-b border-border px-2">
      <span className="shrink-0 text-content-muted">
        <Icon name="search" color="text-current" />
      </span>
      <input
        ref={props.inputRef as LegacyRef<HTMLInputElement>}
        className="min-w-0 flex-1 bg-transparent text-[12px] font-medium leading-4 text-content outline-none placeholder:text-content-muted"
        placeholder="Search..."
        value={props.value}
        autoComplete="off"
        onChange={(e) => props.onChange(e.target.value)}
        onKeyDown={props.onKeyDown}
      />
      <span className="shrink-0 text-content-muted">
        <Icon name="chevrons-up-down" color="text-current" />
      </span>
    </div>
  );
}
