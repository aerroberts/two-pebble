/**
 * Recorded when the task transitions to a new effective status.
 * The reason field captures the natural-language motivation; the engine
 * synthesizes one for cascaded changes through the dependency graph.
 */
export interface TaskStatusEvent {
  id: string;
  createdAt: number;
  updatedAt: number;
  taskId: string;
  kind: 'status';
  reason: string;
  status: 'blocked' | 'open' | 'working' | 'waiting' | 'success' | 'failure' | 'canceled';
}
