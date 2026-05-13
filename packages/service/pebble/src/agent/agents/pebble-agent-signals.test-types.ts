import type { AgentSignal } from '../signal-runner';

export interface SignalSnapshotRecord {
  openAwaited: AgentSignal[];
  received: AgentSignal[];
}

export type WaitStatus = 'idle' | 'waiting';
