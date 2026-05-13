export interface PebbleAgentToolCallRequestedTrace {
  type: 'tool-call-requested';
  data: {
    callId: string;
    input: object;
    source?: 'cli' | 'framework' | 'native';
    toolId: string;
  };
}
