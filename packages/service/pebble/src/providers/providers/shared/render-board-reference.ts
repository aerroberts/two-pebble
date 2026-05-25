/**
 * Public shape of a resolved `boardReference` cell's content. Board
 * references deliberately stay compact so user-selected boards establish
 * identity without dumping task state into every model turn.
 */
export interface BoardReferenceCellContent {
  boardId: string;
  name: string;
}

export function renderBoardReferenceText(content: BoardReferenceCellContent): string {
  return `[board: ${content.name} (id: ${content.boardId})]`;
}
