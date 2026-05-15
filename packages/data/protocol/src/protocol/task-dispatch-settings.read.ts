export type TaskDispatchSettingsScopeKind = 'board' | 'pool';
export type TaskDispatchSettingsMode = 'manual' | 'automatic';

export interface TaskDispatchSettingsRecord {
  scopeKind: TaskDispatchSettingsScopeKind;
  scopeId: string;
  concurrency: number;
  dispatchMode: TaskDispatchSettingsMode;
  autoAgentRegistryId: string | null;
}

export interface TaskDispatchSettingsReadOperation {
  name: 'readTaskDispatchSettings';
  request: {
    scopeKind: TaskDispatchSettingsScopeKind;
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
