export interface PebbleAgentConversationThreadSnapshotTrace {
  type: 'conversation-thread-snapshot';
  data: {
    threadCursor: string;
  };
}
