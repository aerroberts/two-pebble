import type { ReactNode } from 'react';

import { Icon } from '../../content/icon/icon';

export interface DataValueProps {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  value?: ReactNode;
  trailingAccessory?: ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

export function DataValue(props: DataValueProps) {
  const iconNode = props.icon ? (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
      {typeof props.icon === 'string' ? <Icon name={props.icon} color="text-accent" /> : props.icon}
    </span>
  ) : null;

  const titleBlock = (
    <div className="min-w-0 flex-1">
      <div className="truncate text-sm font-normal text-content">{props.title}</div>
      {props.subtitle ? <div className="mt-0.5 text-xs leading-4 text-content-muted">{props.subtitle}</div> : null}
    </div>
  );

  const valueNode = props.value ? (
    <div className="shrink-0 text-right text-sm font-medium text-content">{props.value}</div>
  ) : null;

  const trailingNode = props.trailingAccessory ? (
    <span className="text-content-muted">{props.trailingAccessory}</span>
  ) : null;

  const isInteractive = Boolean(props.href || props.onClick);
  const rowBgClass = props.active ? 'bg-accent/[0.12]' : isInteractive ? 'hover:bg-surface-hover' : '';
  const baseRowClass = `group block w-full px-3 py-2 text-left transition-colors ${rowBgClass}`.trim();

  // When the row is interactive AND has a trailing accessory, render the accessory
  // outside the clickable element so it can host its own buttons/handlers.
  if (isInteractive && trailingNode) {
    const interactiveInner = (
      <div className="flex min-w-0 items-center gap-2.5">
        {iconNode}
        {titleBlock}
      </div>
    );
    const interactiveClass = 'min-w-0 flex-1 cursor-pointer text-left';
    const interactiveElement = props.href ? (
      <a href={props.href} className={interactiveClass}>
        {interactiveInner}
      </a>
    ) : (
      <button type="button" className={interactiveClass} onClick={props.onClick}>
        {interactiveInner}
      </button>
    );

    return (
      <div className={`group flex w-full items-center gap-4 px-3 py-2 transition-colors ${rowBgClass}`.trim()}>
        {interactiveElement}
        <div className="flex shrink-0 items-center justify-end gap-2">
          {valueNode}
          {trailingNode}
        </div>
      </div>
    );
  }

  const content = (
    <div className="flex min-w-0 items-center gap-2.5">
      {iconNode}
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
        {titleBlock}
        {valueNode || trailingNode ? (
          <div className="flex shrink-0 items-center justify-end gap-2">
            {valueNode}
            {trailingNode}
          </div>
        ) : null}
      </div>
    </div>
  );

  if (props.href) {
    return (
      <a href={props.href} className={`${baseRowClass} cursor-pointer`}>
        {content}
      </a>
    );
  }

  if (props.onClick) {
    return (
      <button type="button" className={`${baseRowClass} cursor-pointer`} onClick={props.onClick}>
        {content}
      </button>
    );
  }

  return <div className={baseRowClass}>{content}</div>;
}
