import type { ReactNode, TextareaHTMLAttributes } from 'react';

export interface InputAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label?: ReactNode;
}

export function InputArea(props: InputAreaProps) {
  const { label, disabled, ...textareaProps } = props;
  const disabledClass = disabled ? 'cursor-not-allowed opacity-55' : '';
  const wrapperClass = label ? 'flex w-full flex-col gap-0.5 py-1.5' : 'flex w-full flex-col';

  return (
    <label className={wrapperClass}>
      {label ? <span className="text-[12px] font-medium leading-4 text-content">{label}</span> : null}
      <div
        className={`flex rounded-sm border border-border bg-surface transition-colors focus-within:border-accent ${disabledClass}`}
      >
        <textarea
          className="h-full w-full min-h-[5rem] bg-transparent px-2 py-1.5 text-[12px] font-medium leading-4 text-content outline-none placeholder:text-content-muted resize-y"
          disabled={disabled}
          {...textareaProps}
        />
      </div>
    </label>
  );
}
