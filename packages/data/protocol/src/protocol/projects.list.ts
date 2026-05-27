export interface ProjectRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  assistantAgentRegistryId: string | null;
  assistantAgentId: string | null;
}

export interface ProjectsListOperation {
  name: 'listProjects';
  request: Record<string, never>;
  response: {
    items: ProjectRecord[];
  };
}
