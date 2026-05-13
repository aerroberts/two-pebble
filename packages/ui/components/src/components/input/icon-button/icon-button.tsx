import type { ButtonHTMLAttributes, CSSProperties } from 'react';

import { Icon } from '../../content/icon/icon';

export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: string;
  variant?: 'primary' | 'secondary';
  /**
   * Visual size. Accepts a named preset (`sm`, `md`, `lg`) or a pixel number.
   * When a number is given, the button is rendered at that exact size and the icon is scaled to ~50%.
   * Defaults to `sm` (28px button, 14px icon).
   */
  size?: IconButtonSize | number;
}

const sizePresetClasses: Record<IconButtonSize, string> = {
  sm: 'h-7 w-7 [&_svg]:h-3.5 [&_svg]:w-3.5',
  md: 'h-9 w-9 [&_svg]:h-4 [&_svg]:w-4',
  lg: 'h-10 w-10 [&_svg]:h-5 [&_svg]:w-5',
};

export function IconButton(props: IconButtonProps) {
  const { icon, className, variant = 'primary', size = 'sm', disabled, style, ...rest } = props;
  const variantClass =
    variant === 'secondary'
      ? 'bg-transparent text-content hover:bg-surface-hover'
      : 'bg-accent text-accent-content hover:bg-accent-hover';
  const disabledClass = disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer';

  const isNumericSize = typeof size === 'number';
  const sizeClass = isNumericSize ? '' : sizePresetClasses[size];
  const numericStyle: CSSProperties | undefined = isNumericSize
    ? { width: size, height: size, ...(style ?? {}) }
    : style;
  const iconPx = isNumericSize ? Math.round(size * 0.5) : undefined;

  const classes =
    `inline-flex items-center justify-center rounded-sm transition-colors ${sizeClass} ${variantClass} ${disabledClass} ${className ?? ''}`.trim();

  return (
    <button type="button" className={classes} disabled={disabled} style={numericStyle} {...rest}>
      {isNumericSize ? (
        <span style={{ width: iconPx, height: iconPx, display: 'inline-flex' }}>
          <Icon name={icon} color="text-current" />
        </span>
      ) : (
        <Icon name={icon} color="text-current" />
      )}
    </button>
  );
}
