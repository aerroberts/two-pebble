'use client';

import { type ReactNode, useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Icon } from '../../content/icon/icon';

export interface AutocompleteSuggestion {
  label: string;
  value: string;
  icon?: ReactNode;
}

export interface AutocompleteInputProps {
  value: string;
  suggestions: AutocompleteSuggestion[];
  onChange: (value: string) => void;
  onCommit?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  leadingIcon?: string;
  disabled?: boolean;
  variant?: 'default' | 'borderless';
  className?: string;
  label?: ReactNode;
  ariaLabel?: string;
  maxSuggestions?: number;
  /** Focus the input on mount. Used when the field is the primary control inside a popover. */
  autoFocus?: boolean;
}

const wrapperBase =
  'inline-flex h-7 w-full min-w-[12rem] items-center gap-1.5 text-left text-[12px] font-medium leading-4 text-content transition-colors';

const wrapperVariants = {
  default: 'rounded-md border border-border bg-surface focus-within:border-accent',
  borderless: 'rounded-md bg-transparent hover:bg-surface-hover focus-within:bg-surface-hover',
} as const;

export function AutocompleteInput(props: AutocompleteInputProps) {
  const {
    value,
    suggestions,
    onChange,
    onCommit,
    onBlur,
    placeholder,
    leadingIcon,
    disabled,
    variant = 'default',
    className,
    label,
    ariaLabel,
    maxSuggestions = 10,
    autoFocus,
  } = props;

  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const trimmedQuery = value.trim().toLowerCase();
  const filtered = (
    trimmedQuery.length === 0 ? suggestions : suggestions.filter((s) => s.label.toLowerCase().includes(trimmedQuery))
  ).slice(0, maxSuggestions);

  const updateRect = useCallback(() => {
    const el = wrapperRef.current;
    if (el) {
      setRect(el.getBoundingClientRect());
    }
  }, []);

  const openDropdown = useCallback(() => {
    if (disabled) {
      return;
    }
    updateRect();
    setHighlighted(-1);
    setOpen(true);
  }, [disabled, updateRect]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setHighlighted(-1);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target) || listRef.current?.contains(target)) {
        return;
      }
      closeDropdown();
    };
    const onScroll = () => {
      updateRect();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, closeDropdown, updateRect]);

  const handleSelect = useCallback(
    (next: string) => {
      onChange(next);
      onCommit?.(next);
      closeDropdown();
      inputRef.current?.blur();
    },
    [closeDropdown, onChange, onCommit],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        openDropdown();
        return;
      }
      setHighlighted((current) => Math.min(current + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const highlightedOption = highlighted >= 0 ? filtered[highlighted] : undefined;
      if (highlightedOption) {
        handleSelect(highlightedOption.value);
        return;
      }
      handleSelect(value);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeDropdown();
      inputRef.current?.blur();
    } else if (event.key === 'Tab') {
      closeDropdown();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
    setHighlighted(-1);
    if (!open) {
      openDropdown();
    } else {
      updateRect();
    }
  };

  const handleFocus = () => {
    openDropdown();
  };

  const handleBlur = () => {
    onBlur?.();
  };

  const wrapperClassName = [
    wrapperBase,
    wrapperVariants[variant],
    disabled ? 'cursor-not-allowed opacity-55' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const wrapperWidthClassName = ['flex w-full flex-col', label ? 'gap-0.5 py-1.5' : ''].filter(Boolean).join(' ');

  const inputElement = (
    <div ref={wrapperRef} className={wrapperClassName}>
      {leadingIcon ? (
        <div className="pl-2 text-content-muted [&_svg]:h-3.5 [&_svg]:w-3.5">
          <Icon name={leadingIcon} color="text-current" />
        </div>
      ) : null}
      <input
        ref={inputRef}
        type="text"
        autoComplete="off"
        autoFocus={autoFocus}
        spellCheck={false}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        className="h-full w-full bg-transparent px-2 text-[12px] font-medium leading-4 text-content outline-none placeholder:text-content-muted"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      {open && rect
        ? createPortal(
            <div
              ref={listRef}
              id={listboxId}
              role="listbox"
              className="fixed z-[1100] overflow-hidden rounded-md border border-border bg-surface shadow-lg"
              style={{ top: rect.bottom + 4, left: rect.left, width: rect.width }}
            >
              {filtered.length === 0 ? (
                <div className="px-2 py-4 text-center text-[12px] font-medium leading-4 text-content-muted">
                  No matches
                </div>
              ) : (
                <div className="max-h-[240px] overflow-y-auto p-1">
                  {filtered.map((suggestion, index) => {
                    const isHighlighted = index === highlighted;
                    const isSelected = suggestion.value === value;
                    return (
                      <div
                        key={suggestion.value}
                        role="option"
                        tabIndex={-1}
                        aria-selected={isSelected}
                        className={`cursor-pointer rounded-md px-2 py-1.5 text-[12px] font-medium leading-4 text-content outline-none ${isHighlighted ? 'bg-surface-hover' : ''} ${isSelected ? 'bg-accent/[0.12] text-accent' : ''}`}
                        onPointerEnter={() => setHighlighted(index)}
                        onPointerDown={(event) => {
                          event.preventDefault();
                          handleSelect(suggestion.value);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          {suggestion.icon ? <span className="shrink-0">{suggestion.icon}</span> : null}
                          <span className="truncate">{suggestion.label}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>,
            document.body,
          )
        : null}
    </div>
  );

  if (label) {
    return (
      <div className={wrapperWidthClassName}>
        <span className="text-[12px] font-medium leading-4 text-content">{label}</span>
        {inputElement}
      </div>
    );
  }

  return inputElement;
}
