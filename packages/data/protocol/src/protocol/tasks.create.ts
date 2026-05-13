export interface TasksCreateOperation {
  name: 'createTask';
  request: {
    boardId: string;
    poolId: string | null;
    name: string;
    description?: string;
    dependsOn: string[];
  };
  response: {
    id: string;
  };
}
