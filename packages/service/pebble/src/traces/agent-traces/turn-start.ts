export interface PebbleAgentTurnStartTrace {
  type: 'turn-start';
  data: {
    step: number;
    totalSteps?: number;
  };
}
