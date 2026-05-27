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
  /**
   * `plain` (default) — transparent trigger, the historical look.
   * `pill` — wraps the trigger in a soft rounded chip so the selector reads
   * as a distinct badge against a busy or low-contrast surrounding (e.g. the
   * Cmd+K overlay backdrop).
   */
  variant?: 'plain' | 'pill';
}

const TRIGGER_BASE =
  'inline-flex items-center gap-1 text-[12px] font-medium leading-4 text-content-muted transition-colors hover:text-content focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-55';

const TRIGGER_VARIANT: Record<NonNullable<MinimalSelectProps['variant']>, string> = {
  plain: 'rounded-sm bg-transparent px-1',
  pill: 'rounded-full bg-surface-hover px-2 py-0.5',
};

/**
 * Tiny dropdown trigger — selected label + a chevron, no border, no
 * input-style padding. Suited to inline-with-text uses where a full
 * `Select` chrome would dominate the surrounding control (e.g. agent
 * picker tucked under a composer input).
 */
export function MinimalSelect(props: MinimalSelectProps) {
  const variant = props.variant ?? 'plain';
  return (
    <RadixSelect.Root
      value={props.value}
      defaultValue={props.defaultValue}
      onValueChange={props.onChange}
      disabled={props.disabled}
    >
      <RadixSelect.Trigger aria-label={props.ariaLabel} className={`${TRIGGER_BASE} ${TRIGGER_VARIANT[variant]}`}>
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
