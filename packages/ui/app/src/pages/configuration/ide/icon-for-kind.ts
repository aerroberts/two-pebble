import type { KnownIdeKind } from '@two-pebble/realtime';

export function iconForKind(kind: KnownIdeKind): string {
  switch (kind) {
    case 'cursor':
      return 'mouse-pointer-click';
    case 'zed':
      return 'zap';
    case 'other':
    case 'vscode':
      return 'code';
  }
}
