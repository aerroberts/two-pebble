export interface TaskPoolRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  boardId: string;
  parentPoolId: string | null;
  name: string;
}

export interface TaskPoolsListOperation {
  name: 'listTaskPools';
  request: {
    boardId: string;
  };
  response: {
    items: TaskPoolRecord[];
  };
}
