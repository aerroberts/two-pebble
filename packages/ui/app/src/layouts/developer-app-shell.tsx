import type { AppShellProps } from './app-shell-props';
import { MainAppShell } from './main-app-shell';

export function DeveloperAppShell(props: AppShellProps) {
  return <MainAppShell>{props.children}</MainAppShell>;
}
