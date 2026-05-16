/**
 * Defines the ThreadsListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface ThreadsListOperation {
  name: 'listThreads';
  request: Record<string, never>;
  response: {
    items: {
      agentIds: string[];
      cellCount: number;
      createdAt: number;
      threadId: string;
      updatedAt: number;
    }[];
  };
}
