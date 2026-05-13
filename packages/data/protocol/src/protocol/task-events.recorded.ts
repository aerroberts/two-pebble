import type { TaskEventRecord } from '../task-events';

export interface TaskEventRecordedEvent {
  name: 'taskEventRecorded';
  payload: TaskEventRecord;
}
