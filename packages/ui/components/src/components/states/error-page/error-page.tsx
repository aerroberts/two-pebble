import type { HTMLAttributes, ReactNode } from 'react';

import { TwoPebbleLogo } from '../../branding/two-pebble-logo/two-pebble-logo';
import { Icon } from '../../content/icon/icon';

export interface ErrorPageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title'> {
  details?: ReactNode;
  errorMessage?: string;
  message?: ReactNode;
  scope?: 'contained' | 'viewport';
  title?: ReactNode;
}

export function ErrorPage(props: ErrorPageProps) {
  const {
    details,
    errorMessage,
    message = "We couldn't finish this request. Try again in a moment, or return to the previous screen and continue from there.",
    scope = 'viewport',
    title = 'Something went wrong',
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
            <Icon name="x" color="text-danger" />
            {title}
          </h1>
          <div className="mt-2 text-sm leading-6 text-content-muted">{message}</div>
          {errorMessage ? (
            <textarea
              aria-label="Error message"
              className="mt-5 h-52 w-full resize-none rounded-md bg-danger/5 px-3 py-2.5 font-mono text-xs leading-5 text-content-muted outline-none"
              readOnly
              value={errorMessage}
            />
          ) : null}
          {details ? <div className="mt-8 w-full text-left">{details}</div> : null}
        </div>
      </div>
    </div>
  );
}
