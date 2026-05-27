import type { CreateProjectInput, ProjectRecord } from '../states/projects/types';
import type { RealtimeOperationContext } from '../types';

export function createProjectOperation(ctx: RealtimeOperationContext) {
  return async function createProject(input: CreateProjectInput): Promise<ProjectRecord> {
    const project = await ctx.datastore.emit('createProject', input);
    ctx.datastore.patch({ projects: ctx.datastore.state.projects.withItem(project.id, project, 'ready') });
    return project;
  };
}
