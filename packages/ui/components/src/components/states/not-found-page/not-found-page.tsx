import type { HTMLAttributes, ReactNode } from 'react';

import { TwoPebbleLogo } from '../../branding/two-pebble-logo/two-pebble-logo';

export interface NotFoundPageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title'> {
  details?: ReactNode;
  message?: ReactNode;
  scope?: 'contained' | 'viewport';
  title?: ReactNode;
}

export function NotFoundPage(props: NotFoundPageProps) {
  const {
    details,
    message = "The page you requested doesn't exist here anymore, or the address was never valid to begin with.",
    scope = 'viewport',
    title = 'Page not found',
    ...rest
  } = props;
  const rootClassName =
    scope === 'contained'
      ? 'flex min-h-full items-center justify-center'
      : 'flex min-h-screen items-center justify-center bg-background px-6 py-10';

  return (
    <div className={rootClassName} {...rest}>
      <div className="w-full max-w-xl">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <TwoPebbleLogo size="large" />
          <h1 className="mt-6 text-lg tracking-[-0.02em] text-content">
            <span className="mr-3 text-content-muted">?</span>
            {title}
          </h1>
          <div className="mt-2 text-sm leading-6 text-content-muted">{message}</div>
          {details ? <div className="mt-8 w-full text-center">{details}</div> : null}
        </div>
      </div>
    </div>
  );
}
