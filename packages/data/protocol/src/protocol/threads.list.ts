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
