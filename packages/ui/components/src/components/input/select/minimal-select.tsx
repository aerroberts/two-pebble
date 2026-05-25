'use client';

import * as RadixSelect from '@radix-ui/react-select';

import { Icon } from '../../content/icon/icon';
import type { SelectOption } from './select';
import { SelectContent } from './select-content';

export interface MinimalSelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

/**
 * Tiny dropdown trigger — selected label + a chevron, no border, no
 * input-style padding. Suited to inline-with-text uses where a full
 * `Select` chrome would dominate the surrounding control (e.g. agent
 * picker tucked under a composer input).
 */
export function MinimalSelect(props: MinimalSelectProps) {
  return (
    <RadixSelect.Root
      value={props.value}
      defaultValue={props.defaultValue}
      onValueChange={props.onChange}
      disabled={props.disabled}
    >
      <RadixSelect.Trigger
        aria-label={props.ariaLabel}
        className="inline-flex items-center gap-1 rounded-sm bg-transparent px-1 text-[12px] font-medium leading-4 text-content-muted transition-colors hover:text-content focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-55"
      >
        <span className="min-w-0 truncate">
          <RadixSelect.Value placeholder={props.placeholder ?? 'Select'} />
        </span>
        <RadixSelect.Icon className="shrink-0">
          <Icon name="chevron-down" color="text-current" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <SelectContent options={props.options} />
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
