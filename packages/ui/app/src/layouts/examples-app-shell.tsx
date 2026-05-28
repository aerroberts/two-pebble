import type { AppShellProps } from './app-shell-props';
import { MainAppShell } from './main-app-shell';

export function ExamplesAppShell(props: AppShellProps) {
  return <MainAppShell>{props.children}</MainAppShell>;
}
