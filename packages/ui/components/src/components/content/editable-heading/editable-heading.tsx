export type EditableHeadingSize = 'sm' | 'md';

export interface EditableHeadingProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  ariaLabel?: string;
  size?: EditableHeadingSize;
}

const SIZE_CLASS: Record<EditableHeadingSize, string> = {
  sm: 'text-[13px] tracking-[0.12em]',
  md: 'text-[18px] tracking-[0.18em]',
};

export function EditableHeading(props: EditableHeadingProps) {
  const size = props.size ?? 'md';
  const className = `w-full min-w-0 bg-transparent font-heading font-normal uppercase leading-7 text-content outline-none placeholder:text-content-muted focus:text-accent ${SIZE_CLASS[size]}`;
  return (
    <input
      aria-label={props.ariaLabel}
      className={className}
      onBlur={props.onBlur}
      onChange={(event) => props.onChange(event.target.value)}
      placeholder={props.placeholder}
      value={props.value}
    />
  );
}
