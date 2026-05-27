import type { ReactNode } from 'react';

import { DataValue } from '../data-value/data-value';
import type { ListLayoutItem } from './types';

export type { ListLayoutItem };

export interface ListLayoutProps {
  items: ListLayoutItem[];
  emptyState?: ReactNode;
  /**
   * When true, wraps the list in a card outline (border + rounded corners) and
   * renders dividers between rows. Use for top-level lists like the boards on
   * /tasks where the items would otherwise float on the page background.
   */
  bordered?: boolean;
}

export function ListLayout(props: ListLayoutProps) {
  const wrapperClassName = props.bordered
    ? 'w-full overflow-hidden rounded-md border border-border bg-surface'
    : 'w-full overflow-hidden rounded-md bg-surface';

  if (props.items.length === 0) {
    return (
      <div className={wrapperClassName}>
        <div className="px-3 py-4 text-sm text-content-muted">{props.emptyState ?? 'No items available.'}</div>
      </div>
    );
  }

  const rowsClassName = props.bordered ? 'divide-y divide-border' : '';

  return (
    <div className={wrapperClassName}>
      <div className={rowsClassName}>
        {props.items.map((item, index) => {
          const key = item.key ?? `${typeof item.title === 'string' ? item.title : 'item'}-${index}`;
          return (
            <DataValue
              key={key}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              value={item.value}
              trailingAccessory={item.trailingAccessory}
              href={item.href}
              onClick={item.onClick}
              active={item.active}
            />
          );
        })}
      </div>
    </div>
  );
}
