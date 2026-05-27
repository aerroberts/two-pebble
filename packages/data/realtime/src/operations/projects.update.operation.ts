import type { ProjectRecord, UpdateProjectInput } from '../states/projects/types';
import type { RealtimeOperationContext } from '../types';

export function updateProjectOperation(ctx: RealtimeOperationContext) {
  return async function updateProject(input: UpdateProjectInput): Promise<ProjectRecord> {
    const project = await ctx.datastore.emit('updateProject', input);
    ctx.datastore.patch({ projects: ctx.datastore.state.projects.withItem(project.id, project, 'ready') });
    return project;
  };
}
