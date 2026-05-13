import type { TaskEventRecord } from '../task-events';

export interface TaskEventsListOperation {
  name: 'listTaskEvents';
  request: {
    taskId: string;
  };
  response: {
    items: TaskEventRecord[];
  };
}
