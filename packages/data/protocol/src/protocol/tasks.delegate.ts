export interface TasksDelegateOperation {
  name: 'delegateTask';
  request: {
    taskId: string;
    agentRegistryId: string;
  };
  response: {
    agentId: string;
  };
}

export interface TasksUndelegateOperation {
  name: 'undelegateTask';
  request: {
    taskId: string;
  };
  response: {
    id: string;
  };
}
