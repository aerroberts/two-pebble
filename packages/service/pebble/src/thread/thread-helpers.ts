import type { CellContent } from './cells/index';

export function cloneCellContent(cell: CellContent): CellContent {
  return structuredClone(cell);
}
