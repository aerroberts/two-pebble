export interface TaskDispatchSettingsUpdatedEvent {
  name: 'taskDispatchSettingsUpdated';
  payload: TaskDispatchSettingsRecord;
}

export interface TaskDispatchSettingsRecord {
  scopeKind: 'board' | 'pool';
  scopeId: string;
  concurrency: number;
  dispatchMode: 'manual' | 'automatic';
  autoAgentRegistryId: string | null;
}
