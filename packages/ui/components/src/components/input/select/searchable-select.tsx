'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Icon } from '../../content/icon/icon';
import { SearchPanel } from './search-panel';
import { SearchableDropdown } from './searchable-dropdown';
import type { SelectProps } from './select';

const triggerBase =
  'inline-flex h-7 w-full min-w-[12rem] items-center justify-between gap-1.5 px-2 text-left text-[12px] font-medium leading-4 text-content transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-55';

const triggerVariants = {
  default: 'rounded-sm border border-border bg-surface focus:border-accent',
  borderless: 'rounded-sm bg-transparent hover:bg-surface-hover',
} as const;

export function SearchableSelect(props: SelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlighted, setHighlighted] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const isControlled = props.value !== undefined;
  const [internalValue, setInternalValue] = useState(props.defaultValue ?? '');
  const currentValue = isControlled ? props.value : internalValue;
  const selectedOption = props.options.find((o) => o.value === currentValue);
  const selectedLabel = selectedOption?.label ?? '';

  const filteredOptions = (
    search ? props.options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())) : props.options
  ).slice(0, 10);

  const selectValue = useCallback(
    (value: string) => {
      props.onChange?.(value);
      if (!isControlled) setInternalValue(value);
      setOpen(false);
    },
    [props.onChange, isControlled],
  );

  const openDropdown = useCallback(() => {
    if (props.disabled) return;
    const el = triggerRef.current;
    if (!el) return;
    setRect(el.getBoundingClientRect());
    setSearch('');
    setHighlighted(-1);
    setOpen(true);
  }, [props.disabled]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onScroll = () => {
      const el = triggerRef.current;
      if (el) setRect(el.getBoundingClientRect());
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filteredOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filteredOptions[highlighted];
      if (opt) selectValue(opt.value);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setHighlighted(0);
  };

  const variantClass = triggerVariants[props.variant ?? 'default'];
  const wrapperClassName = [props.fullWidth ? 'w-full' : '', props.className ?? ''].filter(Boolean).join(' ');

  const selectElement = (
    <div className={wrapperClassName}>
      <button
        ref={triggerRef}
        type="button"
        disabled={props.disabled}
        className={`${triggerBase} ${variantClass}`}
        onClick={openDropdown}
      >
        <span className="shrink-0 text-content-muted">
          <Icon name="search" color="text-current" />
        </span>
        {selectedOption?.icon ? <span className="shrink-0">{selectedOption.icon}</span> : null}
        <span className="min-w-0 flex-1 truncate text-left">{selectedLabel || props.placeholder || 'Select...'}</span>
        <span className="shrink-0 text-content-muted">
          <Icon name="chevrons-up-down" color="text-current" />
        </span>
      </button>

      {open && rect
        ? createPortal(
            <div
              ref={listRef}
              className="fixed z-[1100] overflow-hidden rounded-sm border border-border bg-surface pb-1 shadow-lg"
              style={{ top: rect.top, left: rect.left, width: rect.width }}
            >
              <SearchPanel inputRef={inputRef} value={search} onChange={handleSearchChange} onKeyDown={handleKeyDown} />
              <SearchableDropdown
                options={filteredOptions}
                currentValue={currentValue}
                highlighted={highlighted}
                onHighlight={setHighlighted}
                onSelect={selectValue}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );

  if (props.label) {
    return (
      <div className="flex flex-col gap-0.5 py-1.5">
        <span className="text-[12px] font-medium leading-4 text-content">{props.label}</span>
        {selectElement}
      </div>
    );
  }

  return selectElement;
}
