import type { HTMLAttributes, ReactNode } from 'react';

import { TwoPebbleLogo } from '../../branding/two-pebble-logo/two-pebble-logo';
import { Icon } from '../../content/icon/icon';

export interface AccessDeniedPageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title'> {
  details?: ReactNode;
  message?: ReactNode;
  scope?: 'contained' | 'viewport';
  title?: ReactNode;
}

export function AccessDeniedPage(props: AccessDeniedPageProps) {
  const {
    details,
    message = "You don't have permission to access this resource. Contact your administrator if you believe this is a mistake.",
    scope = 'viewport',
    title = 'Access denied',
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
          <h1 className="mt-6 flex items-center gap-2 text-lg tracking-[-0.02em] text-content">
            <Icon name="shield-off" color="text-content-muted" />
            {title}
          </h1>
          <div className="mt-2 text-sm leading-6 text-content-muted">{message}</div>
          {details ? <div className="mt-8 w-full text-center">{details}</div> : null}
        </div>
      </div>
    </div>
  );
}
