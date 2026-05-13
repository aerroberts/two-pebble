export interface ButtonGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ButtonGroupProps {
  options: ButtonGroupOption[];
  value: string;
  onChange?: (value: string) => void;
}

export function ButtonGroup(props: ButtonGroupProps) {
  return (
    <div className="inline-flex h-7 self-start overflow-hidden rounded-sm border border-border">
      {props.options.map((option, index) => {
        const isSelected = option.value === props.value;
        const selectedClass = isSelected
          ? 'bg-accent/[0.12] text-accent hover:bg-accent/[0.16]'
          : 'bg-surface text-content hover:bg-surface-hover';
        const cursorClass = option.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer';
        const borderClass = index > 0 ? 'border-l border-border' : '';

        return (
          <button
            key={option.value}
            type="button"
            className={`px-2 text-[12px] font-medium leading-4 transition-colors ${selectedClass} ${cursorClass} ${borderClass}`}
            disabled={option.disabled}
            onClick={() => {
              if (!option.disabled) {
                props.onChange?.(option.value);
              }
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
