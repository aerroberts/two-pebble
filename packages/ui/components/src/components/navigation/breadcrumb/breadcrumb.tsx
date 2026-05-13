import type { HTMLAttributes } from 'react';

import { BreadcrumbLabel } from './breadcrumb-label';
import type { BreadcrumbItem, BreadcrumbItemState } from './types';

export type { BreadcrumbItem, BreadcrumbItemState };

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'className'> {
  items: BreadcrumbItem[];
  mobileItems?: BreadcrumbItem[];
}

export function Breadcrumb(props: BreadcrumbProps) {
  const { items, mobileItems, ...rest } = props;

  const desktopNav = (
    <nav
      className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs font-medium capitalize text-content-muted"
      {...rest}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const itemKey = `${typeof item.label === 'string' ? item.label : index}-${index}`;
        const separator = index > 0 ? <span className="text-content-subtle">/</span> : null;

        return (
          <span key={itemKey} className="flex min-w-0 items-center gap-1.5">
            {separator}
            <BreadcrumbLabel item={item} isLast={isLast} />
          </span>
        );
      })}
    </nav>
  );

  if (!mobileItems) {
    return desktopNav;
  }

  return (
    <>
      <div className="md:hidden">
        <Breadcrumb items={mobileItems} {...rest} />
      </div>
      <div className="hidden md:block">{desktopNav}</div>
    </>
  );
}
