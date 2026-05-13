import type { SelectOption } from './select';

export interface SearchableDropdownProps {
  options: SelectOption[];
  currentValue: string | undefined;
  highlighted: number;
  onHighlight: (index: number) => void;
  onSelect: (value: string) => void;
}

const itemClass = 'cursor-pointer rounded-sm px-2 py-1.5 text-[12px] font-medium leading-4 text-content outline-none';

export function SearchableDropdown(props: SearchableDropdownProps) {
  if (props.options.length === 0) {
    return <div className="px-2 py-4 text-center text-[12px] font-medium leading-4 text-content-muted">No matches</div>;
  }
  return (
    <div className="max-h-[240px] overflow-y-auto p-1" role="listbox">
      {props.options.map((option, i) => (
        <div
          key={option.value}
          role="option"
          tabIndex={-1}
          aria-selected={option.value === props.currentValue}
          className={`${itemClass} ${i === props.highlighted ? 'bg-surface-hover' : ''} ${option.value === props.currentValue ? 'bg-accent/[0.12] text-accent' : ''}`}
          onPointerEnter={() => props.onHighlight(i)}
          onPointerDown={(e) => {
            e.preventDefault();
            props.onSelect(option.value);
          }}
        >
          <span className="flex items-center gap-2">
            {option.icon ? <span className="shrink-0">{option.icon}</span> : null}
            <span>{option.label}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
