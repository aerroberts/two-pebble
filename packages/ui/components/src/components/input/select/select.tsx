'use client';

import type { ReactNode } from 'react';
import { PlainSelect } from './plain-select';
import { SearchableSelect } from './searchable-select';

export interface SelectOption {
  icon?: ReactNode;
  label: string;
  value: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  variant?: 'default' | 'borderless';
  className?: string;
  fullWidth?: boolean;
  mobilePresentation?: 'popover' | 'drawer';
  label?: ReactNode;
}

export function Select(props: SelectProps) {
  if (props.searchable) {
    return <SearchableSelect {...props} />;
  }
  return <PlainSelect {...props} />;
}
