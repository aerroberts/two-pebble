export interface ProjectRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  assistantAgentRegistryId: string | null;
  assistantAgentId: string | null;
  documentRunnerAgentRegistryId: string | null;
  enabledAgentRegistryIds: string[];
}

export interface ProjectsListOperation {
  name: 'listProjects';
  request: Record<string, never>;
  response: {
    items: ProjectRecord[];
  };
}
