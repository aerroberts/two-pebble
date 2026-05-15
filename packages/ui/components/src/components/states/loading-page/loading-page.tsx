import type { HTMLAttributes } from 'react';

import { TwoPebbleLogo } from '../../branding/two-pebble-logo/two-pebble-logo';

export interface LoadingPageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
  scope?: 'contained' | 'viewport';
  /** Explicit minimum height for the `contained` scope (so the spinner centers even inside a parent that doesn't define its own height). */
  minHeight?: string;
}

export function LoadingPage(props: LoadingPageProps) {
  const { scope = 'viewport', minHeight, ...rest } = props;
  const rootClassName =
    scope === 'contained'
      ? 'flex h-full min-h-full w-full items-center justify-center'
      : 'flex min-h-screen items-center justify-center bg-background';

  return (
    <div className={rootClassName} style={minHeight ? { minHeight } : undefined} {...rest}>
      <TwoPebbleLogo svgClassName="loading-rock-spinner h-7 w-7 text-accent" />
    </div>
  );
}
