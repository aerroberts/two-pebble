import { Icon } from '../../content/icon/icon';

export interface InfoFooterItem {
  icon: string;
  text: string;
  iconColor?: string;
  onClick?: () => void;
  textColor?: string;
}

export interface InfoFooterProps {
  leftItems?: InfoFooterItem[];
  rightItems?: InfoFooterItem[];
}

export function InfoFooter(props: InfoFooterProps) {
  return (
    <footer className="absolute inset-x-0 bottom-0 z-20 flex h-5 items-center justify-between border-t border-border bg-surface-alt px-2 text-[11px] leading-5">
      <InfoFooterItems items={props.leftItems ?? []} alignment="left" />
      <InfoFooterItems items={props.rightItems ?? []} alignment="right" />
    </footer>
  );
}

interface InfoFooterItemsProps {
  alignment: 'left' | 'right';
  items: InfoFooterItem[];
}

function InfoFooterItems(props: InfoFooterItemsProps) {
  const classes =
    props.alignment === 'right'
      ? 'flex min-w-0 flex-1 items-center justify-end gap-3 overflow-hidden'
      : 'flex min-w-0 flex-1 items-center justify-start gap-3 overflow-hidden';

  return (
    <div className={classes}>
      {props.items.map((item) => (
        <InfoFooterItemView item={item} key={`${item.icon}-${item.text}`} />
      ))}
    </div>
  );
}

interface InfoFooterItemViewProps {
  item: InfoFooterItem;
}

function InfoFooterItemView(props: InfoFooterItemViewProps) {
  const content = (
    <>
      <Icon name={props.item.icon} color={props.item.iconColor ?? 'text-muted'} className="h-3 w-3 shrink-0" />
      <span className={`min-w-0 overflow-hidden text-ellipsis ${props.item.textColor ?? 'text-muted'}`}>
        {props.item.text}
      </span>
    </>
  );

  if (props.item.onClick !== undefined) {
    return (
      <button
        className="flex min-w-0 shrink cursor-pointer items-center gap-1 overflow-hidden whitespace-nowrap rounded-sm px-1 transition-colors hover:bg-surface-hover"
        onClick={props.item.onClick}
        type="button"
      >
        {content}
      </button>
    );
  }

  return <span className="flex min-w-0 shrink items-center gap-1 overflow-hidden whitespace-nowrap">{content}</span>;
}
