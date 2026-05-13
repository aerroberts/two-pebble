import type { Cell } from './cell';
export type CellContent = ReturnType<(typeof Cell)[keyof typeof Cell]>;
export type DataCells = CellContent[];
