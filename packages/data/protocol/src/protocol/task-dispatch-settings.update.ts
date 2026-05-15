import type {
  TaskDispatchSettingsMode,
  TaskDispatchSettingsRecord,
  TaskDispatchSettingsScopeKind,
} from './task-dispatch-settings.read';

export interface TaskDispatchSettingsUpdateOperation {
  name: 'updateTaskDispatchSettings';
  request: {
    scopeKind: TaskDispatchSettingsScopeKind;
    scopeId: string;
    concurrency: number;
    dispatchMode: TaskDispatchSettingsMode;
    autoAgentRegistryId: string | null;
  };
  response: {
    settings: TaskDispatchSettingsRecord;
  };
}
