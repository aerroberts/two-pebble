import type { TaskCommentEvent } from './comment';
import type { TaskDelegatedEvent } from './delegated';
import type { TaskStatusEvent } from './status';
import type { TaskUndelegatedEvent } from './undelegated';

export type TaskEventRecord = TaskStatusEvent | TaskDelegatedEvent | TaskUndelegatedEvent | TaskCommentEvent;
