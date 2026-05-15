import type { TaskDispatchSettingsRecord } from './task-dispatch-settings.read';

export interface TaskDispatchSettingsUpdatedEvent {
  name: 'taskDispatchSettingsUpdated';
  payload: TaskDispatchSettingsRecord;
}
