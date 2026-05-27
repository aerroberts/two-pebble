import type { ProjectRecord } from './projects.list';

export interface ProjectsCreateOperation {
  name: 'createProject';
  request: {
    assistantAgentId?: string | null;
    assistantAgentRegistryId?: string | null;
    name: string;
  };
  response: ProjectRecord;
}
