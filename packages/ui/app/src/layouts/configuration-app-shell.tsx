import type { AppShellProps } from './app-shell-props';
import { MainAppShell } from './main-app-shell';

export function ConfigurationAppShell(props: AppShellProps) {
  return <MainAppShell>{props.children}</MainAppShell>;
}
