import type { TaskEventRecord } from '../task-events';

/**
 * Defines the TaskEventRecordedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskEventRecordedEvent {
  name: 'taskEventRecorded';
  payload: TaskEventRecord;
}
