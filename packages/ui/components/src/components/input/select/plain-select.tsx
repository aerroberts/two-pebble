'use client';

import * as RadixSelect from '@radix-ui/react-select';

import { Icon } from '../../content/icon/icon';
import type { SelectProps } from './select';
import { SelectContent } from './select-content';

const triggerBase =
  'inline-flex h-7 w-full items-center justify-between gap-1.5 px-2 text-left text-[12px] font-medium leading-4 text-content transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-55';

const triggerVariants = {
  default: 'rounded-md border border-border bg-surface focus:border-accent',
  borderless: 'rounded-md bg-transparent hover:bg-surface-hover',
} as const;

export function PlainSelect(props: SelectProps) {
  const wrapperClassName = [props.fullWidth ? 'w-full min-w-0' : '', props.className ?? ''].filter(Boolean).join(' ');
  const selectedValue = props.value ?? props.defaultValue;
  const selectedOption = props.options.find((option) => option.value === selectedValue);
  const triggerWidthClass = props.fullWidth ? 'min-w-0' : 'min-w-[12rem]';

  const selectElement = (
    <div className={wrapperClassName}>
      <RadixSelect.Root
        value={props.value}
        defaultValue={props.defaultValue}
        open={props.open}
        onOpenChange={props.onOpenChange}
        onValueChange={props.onChange}
        disabled={props.disabled}
      >
        <RadixSelect.Trigger
          className={`${triggerBase} ${triggerWidthClass} ${triggerVariants[props.variant ?? 'default']}`}
        >
          {selectedOption?.icon ? <span className="shrink-0">{selectedOption.icon}</span> : null}
          <span className="min-w-0 flex-1 truncate">
            <RadixSelect.Value placeholder={props.placeholder ?? 'Select...'} />
          </span>
          <RadixSelect.Icon className="shrink-0 text-content-muted">
            <Icon name="chevrons-up-down" color="text-current" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <SelectContent options={props.options} open={props.open} mobilePresentation={props.mobilePresentation} />
        </RadixSelect.Portal>
      </RadixSelect.Root>
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
