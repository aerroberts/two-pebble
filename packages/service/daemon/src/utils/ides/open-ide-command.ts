import type { IdeKind } from '@two-pebble/datatypes';

export function getIdeOpenCommand(
  kind: IdeKind,
  executablePath: string,
  workspacePath: string,
  platform: NodeJS.Platform = process.platform,
): string[] {
  switch (kind) {
    case 'zed': {
      const zedAppPath = platform === 'darwin' ? macAppPathFromExecutable(executablePath) : null;
      return zedAppPath === null ? [executablePath, workspacePath] : ['open', '-a', zedAppPath, workspacePath];
    }
    case 'cursor':
    case 'other':
    case 'vscode':
      return [executablePath, workspacePath];
  }
}

function macAppPathFromExecutable(executablePath: string): string | null {
  const marker = '.app/';
  const markerIndex = executablePath.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }
  return executablePath.slice(0, markerIndex + marker.length - 1);
}
