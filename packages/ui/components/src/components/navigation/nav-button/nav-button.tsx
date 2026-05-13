import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface NavButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> {
  active?: boolean;
  label: ReactNode;
}

export function NavButton(props: NavButtonProps) {
  const { active = false, label, disabled, ...rest } = props;
  const textClass = active ? 'text-accent' : 'text-content-muted hover:text-content';
  const disabledClass = disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer';

  return (
    <button
      className={`font-heading px-1 pb-1 text-[12px] font-normal leading-4 tracking-[0.12em] transition-colors ${textClass} ${disabledClass}`}
      disabled={disabled}
      type="button"
      {...rest}
    >
      {label}
    </button>
  );
}
