import type { ButtonHTMLAttributes } from 'react';

import { Icon } from '../../content/icon/icon';
import { getButtonVariantClassName } from './variant';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  leftIcon?: string;
  rightIcon?: string;
}

export function Button(props: ButtonProps) {
  const { variant = 'secondary', children, className, disabled, leftIcon, rightIcon, ...rest } = props;
  const variantClass = getButtonVariantClassName(variant);
  const disabledClass = disabled
    ? 'cursor-not-allowed opacity-55'
    : 'cursor-pointer active:scale-[0.97]';
  const classes =
    `inline-flex h-7 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-2 text-[12px] font-medium leading-4 transition-[background-color,border-color,color,transform,opacity] duration-150 ease-out [&_svg]:h-3.5 [&_svg]:w-3.5 ${variantClass} ${disabledClass} ${className ?? ''}`.trim();

  return (
    <button className={classes} disabled={disabled} {...rest}>
      {leftIcon ? <Icon name={leftIcon} color="text-current" /> : null}
      {children}
      {rightIcon ? <Icon name={rightIcon} color="text-current" /> : null}
    </button>
  );
}
