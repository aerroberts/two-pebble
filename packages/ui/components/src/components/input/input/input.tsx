import type { InputHTMLAttributes, ReactNode } from 'react';

import { Icon } from '../../content/icon/icon';
import type { InputAction } from './types';

export type { InputAction };

export type InputType = 'text' | 'password' | 'email' | 'url' | 'search' | 'tel' | 'number';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'type'> {
  label?: ReactNode;
  leadingIcon?: string;
  action?: InputAction;
  type?: InputType;
}

export function Input(props: InputProps) {
  const { label, leadingIcon, action, disabled, type, ...inputProps } = props;
  const disabledClass = disabled ? 'cursor-not-allowed opacity-55 grayscale' : 'opacity-100 grayscale-0';
  const actionCursorClass = action?.disabled
    ? 'cursor-not-allowed opacity-55'
    : 'cursor-pointer hover:text-content active:scale-95';
  const wrapperClass = label ? 'flex w-full flex-col gap-0.5 py-1.5' : 'flex w-full flex-col';

  return (
    <label className={wrapperClass}>
      {label ? <span className="text-[12px] font-medium leading-4 text-content">{label}</span> : null}
      <div
        className={`flex h-7 items-center rounded-md border border-border bg-surface transition-[background-color,border-color,color,opacity,filter] duration-200 ease-out focus-within:border-accent ${disabledClass}`}
      >
        {leadingIcon ? (
          <div className="pl-2.5 text-content-muted [&_svg]:h-3.5 [&_svg]:w-3.5">
            <Icon name={leadingIcon} color="text-current" />
          </div>
        ) : null}
        <input
          className="h-full w-full bg-transparent px-2 text-[12px] font-medium leading-4 text-content outline-none placeholder:text-content-muted"
          disabled={disabled}
          type={type ?? 'text'}
          {...inputProps}
        />
        {action ? (
          <button
            className={`flex h-full self-stretch items-center justify-center gap-1.5 pr-2.5 pl-1 text-content-muted transition-[color,transform,opacity] duration-150 ease-out [&_svg]:h-3.5 [&_svg]:w-3.5 ${actionCursorClass}`}
            disabled={action.disabled}
            type="button"
            onClick={action.onClick}
          >
            <span className="h-full w-px shrink-0 bg-border" />
            <Icon name={action.icon} color="text-current" />
          </button>
        ) : null}
      </div>
    </label>
  );
}
