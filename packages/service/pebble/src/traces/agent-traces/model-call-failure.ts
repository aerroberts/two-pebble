export interface PebbleAgentModelCallFailureTrace {
  type: 'model-call-failure';
  data: {
    modelCallId: string;
    error: string;
  };
}
