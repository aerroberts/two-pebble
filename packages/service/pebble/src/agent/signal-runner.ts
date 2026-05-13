import type { PebbleJsonValue } from '../types';

export type AgentSignalKind = 'awaited' | 'push';
export type AgentSignalStatus = 'open' | 'received' | 'resolved';

export interface AgentSignal {
  id: string;
  agentId: string;
  capabilityId: string;
  data: PebbleJsonValue;
  description: string;
  kind: AgentSignalKind;
  name: string;
  signalId: string;
  status: AgentSignalStatus;
}

export interface SignalSnapshot {
  openAwaited: AgentSignal[];
  received: AgentSignal[];
}

export interface RegisterSignalInput {
  capabilityId: string;
  description: string;
  name: string;
  signalId?: string;
}

export interface SendSignalInput {
  agentId: string;
  capabilityId: string;
  data: PebbleJsonValue;
  description: string;
  name: string;
  signalId?: string;
}

export interface ResolveSignalInput {
  agentId: string;
  capabilityId: string;
  data: PebbleJsonValue;
  signalId: string;
}

export interface SignalRunner {
  markResolved(id: string): Promise<void>;
  register(input: RegisterSignalInput): Promise<string>;
  resolve(input: ResolveSignalInput): Promise<void>;
  send(input: SendSignalInput): Promise<void>;
  snapshot(agentId: string): Promise<SignalSnapshot>;
}
