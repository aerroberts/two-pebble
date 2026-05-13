import { Icon } from '../../content/icon/icon';

export interface IconButtonGroupOption {
  value: string;
  icon: string;
  disabled?: boolean;
}

export interface IconButtonGroupProps {
  options: IconButtonGroupOption[];
  value: string;
  onChange?: (value: string) => void;
}

export function IconButtonGroup(props: IconButtonGroupProps) {
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
            className={`px-2 transition-colors [&_svg]:h-3.5 [&_svg]:w-3.5 ${selectedClass} ${cursorClass} ${borderClass}`}
            disabled={option.disabled}
            onClick={() => {
              if (!option.disabled) {
                props.onChange?.(option.value);
              }
            }}
          >
            <Icon name={option.icon} color="text-current" />
          </button>
        );
      })}
    </div>
  );
}
