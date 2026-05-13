import { ErrorPage } from '@two-pebble/components';
import type { ErrorInfo } from 'react';
import { Component, createElement } from 'react';
import type { AppErrorBoundaryProps, AppErrorBoundaryState } from './types';

/**
 * Catches render-time React failures and shows the shared app error state.
 *
 * React error boundaries still require class components. This class stays thin:
 * it records the thrown error, reports it to the console, and delegates all UI
 * rendering to the component library error page.
 */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public readonly state: AppErrorBoundaryState = {
    error: null,
  };

  /**
   * Records the render failure after React captures it.
   *
   * The console report keeps the development stack visible while the user sees
   * a stable full-screen error page instead of a broken route tree.
   */
  public componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info);
    this.setState({ error });
  }

  /**
   * Renders children until an error is captured.
   *
   * Once a failure is present, the shared ErrorPage owns the visible fallback.
   */
  public render() {
    if (this.state.error !== null) {
      return createElement(ErrorPage, {
        details: this.state.error.message,
        message: 'The app hit a rendering error. Check the logs or reload after fixing the issue.',
        title: 'App render failed',
      });
    }

    return this.props.children;
  }
}
