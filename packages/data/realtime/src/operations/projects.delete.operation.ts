import type { DeleteProjectInput } from '../states/projects/types';
import type { RealtimeOperationContext } from '../types';

export function deleteProjectOperation(ctx: RealtimeOperationContext) {
  return async function deleteProject(input: DeleteProjectInput) {
    const result = await ctx.datastore.emit('deleteProject', input);
    ctx.datastore.patch({ projects: ctx.datastore.state.projects.withoutItem(result.id) });
    return result;
  };
}
