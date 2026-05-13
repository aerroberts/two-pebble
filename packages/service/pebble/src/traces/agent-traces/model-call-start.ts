export interface PebbleAgentModelCallStartTrace {
  type: 'model-call-start';
  data: {
    modelCallId: string;
    modelId: string;
    provider: string;
    threadCursor: string;
  };
}
