export interface TaskDispatchSettingsRecord {
  scopeKind: 'board' | 'pool';
  scopeId: string;
  concurrency: number;
  dispatchMode: 'manual' | 'automatic';
  autoAgentRegistryId: string | null;
}

export interface TaskDispatchSettingsReadOperation {
  name: 'readTaskDispatchSettings';
  request: {
    scopeKind: 'board' | 'pool';
    scopeId: string;
  };
  response: {
    settings: TaskDispatchSettingsRecord | null;
  };
}

export interface TaskDispatchSettingsListOperation {
  name: 'listTaskDispatchSettings';
  request: Record<string, never>;
  response: {
    items: TaskDispatchSettingsRecord[];
  };
}
