export interface TaskDispatchSettingsUpdateOperation {
  name: 'updateTaskDispatchSettings';
  request: {
    scopeKind: 'board' | 'pool';
    scopeId: string;
    concurrency: number;
    dispatchMode: 'manual' | 'automatic';
    autoAgentRegistryId: string | null;
  };
  response: {
    settings: TaskDispatchSettingsRecord;
  };
}

export interface TaskDispatchSettingsRecord {
  scopeKind: 'board' | 'pool';
  scopeId: string;
  concurrency: number;
  dispatchMode: 'manual' | 'automatic';
  autoAgentRegistryId: string | null;
}
