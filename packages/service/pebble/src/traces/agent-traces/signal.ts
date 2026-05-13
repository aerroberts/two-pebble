export interface PebbleAgentSignalTraceData {
  capabilityId: string;
  data?: boolean | null | number | object | string;
  description: string;
  kind: 'awaited' | 'push';
  name: string;
  signalId: string;
  status: 'open' | 'received' | 'resolved';
}

export interface PebbleAgentSignalRegisteredTrace {
  type: 'signal-registered';
  data: PebbleAgentSignalTraceData;
}

export interface PebbleAgentSignalReceivedTrace {
  type: 'signal-received';
  data: PebbleAgentSignalTraceData;
}

export interface PebbleAgentSignalResolvedTrace {
  type: 'signal-resolved';
  data: PebbleAgentSignalTraceData;
}

export interface PebbleAgentWaitingTrace {
  type: 'agent-waiting';
  data: {
    signals: PebbleAgentSignalTraceData[];
  };
}
