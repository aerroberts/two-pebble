import { getBreadcrumbStateClass } from './state-class';
import type { BreadcrumbItem } from './types';

export interface BreadcrumbLabelProps {
  item: BreadcrumbItem;
  isLast: boolean;
}

export function BreadcrumbLabel(props: BreadcrumbLabelProps) {
  const { item, isLast } = props;

  // Step-mode: caller supplied a state — render as button if onClick, else plain span.
  if (item.state) {
    const classes = `truncate transition-colors ${getBreadcrumbStateClass(item.state)}`;
    if (item.onClick && item.state !== 'current') {
      return (
        <button type="button" onClick={item.onClick} className={`cursor-pointer hover:underline ${classes}`}>
          {item.label}
        </button>
      );
    }
    return <span className={classes}>{item.label}</span>;
  }

  // Legacy URL-breadcrumb mode.
  if (item.onClick && !isLast) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        className="truncate transition-colors text-content-muted hover:text-content"
      >
        {item.label}
      </button>
    );
  }
  if (item.href && !isLast) {
    return (
      <a className="truncate transition-colors hover:text-content" href={item.href}>
        {item.label}
      </a>
    );
  }
  return <span className={`truncate ${isLast ? 'text-content' : ''}`}>{item.label}</span>;
}
