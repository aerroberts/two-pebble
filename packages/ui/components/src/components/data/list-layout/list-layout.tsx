import type { ReactNode } from 'react';

import { DataValue } from '../data-value/data-value';
import type { ListLayoutItem } from './types';

export type { ListLayoutItem };

export interface ListLayoutProps {
  items: ListLayoutItem[];
  emptyState?: ReactNode;
}

export function ListLayout(props: ListLayoutProps) {
  if (props.items.length === 0) {
    return (
      <div className="w-full overflow-hidden rounded-md bg-surface">
        <div className="px-3 py-4 text-sm text-content-muted">{props.emptyState ?? 'No items available.'}</div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-md bg-surface">
      <div>
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
