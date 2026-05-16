import type { TaskEventRecord } from '../task-events';

/**
 * Defines the TaskEventsListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskEventsListOperation {
  name: 'listTaskEvents';
  request: {
    taskId: string;
  };
  response: {
    items: TaskEventRecord[];
  };
}
