export interface ProjectRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  assistantAgentRegistryId: string | null;
  assistantAgentId: string | null;
}
