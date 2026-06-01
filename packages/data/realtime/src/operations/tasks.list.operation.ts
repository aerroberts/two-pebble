import type { RealtimeOperationContext } from '../types';

export interface ListInput {
  boardId: string;
}

export function listTasksOperation(ctx: RealtimeOperationContext) {
  return async function listTasks(input: ListInput) {
    const result = await ctx.datastore.emit('listTasks', input);
    // The daemon returns a single board's tasks into a global registry, so a
    // full-collection replace wipes other boards' rows and discards any
    // taskUpdated events that landed during the in-flight window. Merge by id;
    // deletions propagate via taskDeleted push events.
    ctx.datastore.patch({ tasks: ctx.datastore.state.tasks.withMergedReadyItems(result.items) });
  };
}
