export interface TasksCreateOperation {
  name: 'createTask';
  request: {
    boardId: string;
    poolId: string | null;
    name: string;
    description?: string;
    templateId?: string | null;
    dependsOn: string[];
  };
  response: {
    id: string;
  };
}
