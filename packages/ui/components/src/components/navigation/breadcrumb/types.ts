import type { ReactNode } from 'react';

export type BreadcrumbItemState = 'completed' | 'current' | 'upcoming';

export interface BreadcrumbItem {
  /** Destination URL. Rendered as an `<a>`. Ignored when `onClick` is provided. */
  href?: string;
  /** Visible label. */
  label: ReactNode;
  /** In-app click handler. When provided, the item renders as a `<button>`. */
  onClick?: () => void;
  /**
   * Progression state, used to style multi-step flows (step-nav style).
   * - `completed`: previous steps — muted, clickable when `onClick`/`href` provided
   * - `current`: active step — bold
   * - `upcoming`: future steps — subtle
   * When omitted, the last item is styled as `current` and the rest as links (legacy URL breadcrumb mode).
   */
  state?: BreadcrumbItemState;
}
