import type { InputHTMLAttributes } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function Checkbox(props: CheckboxProps) {
  const { label, className, ...rest } = props;

  return (
    <label className={`inline-flex items-center gap-2 text-[12px] font-medium leading-4 ${className ?? ''}`.trim()}>
      <input
        type="checkbox"
        className="h-4 w-4 rounded-sm border border-border bg-surface accent-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        {...rest}
      />
      {label && <span className="text-content">{label}</span>}
    </label>
  );
}
