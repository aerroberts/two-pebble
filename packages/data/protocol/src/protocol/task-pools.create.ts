export interface TaskPoolsCreateOperation {
  name: 'createTaskPool';
  request: {
    boardId: string;
    parentPoolId: string | null;
    name: string;
    dependsOn: string[];
  };
  response: {
    id: string;
  };
}
