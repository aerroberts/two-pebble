export interface PebbleAgentModelCallTrace {
  type: 'model-call';
  data: {
    modelCallId: string;
    status: 'error' | 'success' | 'pending';
    duration?: number;
    error?: string;
  };
}
