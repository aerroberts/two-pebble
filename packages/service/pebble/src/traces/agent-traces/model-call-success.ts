export interface PebbleAgentModelCallSuccessTrace {
  type: 'model-call-success';
  data: {
    modelCallId: string;
  };
}
