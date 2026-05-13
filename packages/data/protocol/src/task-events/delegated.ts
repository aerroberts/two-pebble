/**
 * Recorded when a task is delegated to an agent.
 * Carries hard references to both the agent instance and the registry row
 * that launched it, so consumers can navigate to either side of the link.
 */
export interface TaskDelegatedEvent {
  id: string;
  createdAt: number;
  updatedAt: number;
  taskId: string;
  kind: 'delegated';
  reason: string;
  agentId: string;
  agentRegistryId: string;
  agentName: string;
}
