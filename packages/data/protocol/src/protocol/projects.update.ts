import type { ProjectRecord } from './projects.list';

export interface ProjectsUpdateOperation {
  name: 'updateProject';
  request: {
    assistantAgentId?: string | null;
    assistantAgentRegistryId?: string | null;
    documentRunnerAgentRegistryId?: string | null;
    enabledAgentRegistryIds?: string[];
    id: string;
    name?: string;
  };
  response: ProjectRecord;
}
