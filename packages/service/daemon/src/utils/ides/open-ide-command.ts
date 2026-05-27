import type { IdeKind } from '@two-pebble/datatypes';

export function getIdeOpenCommand(kind: IdeKind, executablePath: string, workspacePath: string): string[] {
  switch (kind) {
    case 'cursor':
    case 'other':
    case 'vscode':
    case 'zed':
      return [executablePath, workspacePath];
  }
}
