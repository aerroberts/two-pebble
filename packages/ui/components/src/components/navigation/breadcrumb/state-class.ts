import type { BreadcrumbItemState } from './types';

export function getBreadcrumbStateClass(state: BreadcrumbItemState): string {
  switch (state) {
    case 'completed':
      return 'text-content-muted hover:text-content';
    case 'current':
      return 'font-semibold text-content';
    case 'upcoming':
      return 'text-content-subtle';
  }
}
