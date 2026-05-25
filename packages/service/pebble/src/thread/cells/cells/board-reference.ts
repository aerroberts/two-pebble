export interface BoardReferenceCellInput {
  boardId: string;
  name: string;
}

export function boardReference(input: BoardReferenceCellInput) {
  return {
    type: 'boardReference' as const,
    content: {
      boardId: input.boardId,
      name: input.name,
    },
  };
}
