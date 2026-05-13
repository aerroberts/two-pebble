export interface TaskBoardRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
}

export interface TaskBoardsListOperation {
  name: 'listTaskBoards';
  request: Record<string, never>;
  response: {
    items: TaskBoardRecord[];
  };
}
