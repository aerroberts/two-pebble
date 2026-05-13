export interface PebbleAgentToolCallStartTrace {
  type: 'tool-call-start';
  data: {
    callId: string;
    input: object;
    source?: 'cli' | 'framework' | 'native';
    toolId: string;
  };
}
