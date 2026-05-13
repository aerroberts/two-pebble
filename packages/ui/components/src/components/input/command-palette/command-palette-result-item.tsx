import type { CommandPaletteItem } from './command-palette';

interface CommandPaletteResultItemProps {
  item: CommandPaletteItem;
  active: boolean;
  onSelect: () => void;
  onHover: () => void;
}

export function CommandPaletteResultItem(props: CommandPaletteResultItemProps) {
  return (
    <button
      type="button"
      data-active={props.active}
      className={`flex w-full flex-col gap-0.5 px-3 py-2 text-left transition-colors ${
        props.active ? 'bg-accent/[0.12]' : ''
      }`}
      onClick={props.onSelect}
      onMouseEnter={props.onHover}
    >
      <span className="text-[13px] font-medium leading-5 text-content">{props.item.label}</span>
      {props.item.description ? (
        <span className="text-[11px] leading-4 text-content-muted">{props.item.description}</span>
      ) : null}
    </button>
  );
}
