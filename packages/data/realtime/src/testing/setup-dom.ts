import { Window } from 'happy-dom';
import type { ConsoleArguments } from './types';

let consolePatched = false;

export function setupDom(): void {
  patchConsole();

  if (typeof document !== 'undefined') {
    return;
  }

  const window = new Window();
  Object.assign(global, {
    IS_REACT_ACT_ENVIRONMENT: true,
    document: window.document,
    HTMLElement: window.HTMLElement,
    navigator: window.navigator,
    window,
  });
}

function patchConsole(): void {
  if (consolePatched) {
    return;
  }

  const error = console.error;
  console.error = (...args: ConsoleArguments) => {
    if (isReactActWarning(args)) {
      return;
    }

    error(...args);
  };
  consolePatched = true;
}

function isReactActWarning(args: ConsoleArguments): boolean {
  const first = args[0];
  return typeof first === 'string' && first.includes('not wrapped in act');
}
