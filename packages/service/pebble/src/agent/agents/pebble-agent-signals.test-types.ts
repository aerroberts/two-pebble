import type { AgentSignal } from '../../bridge';

export interface SignalSnapshotRecord {
  openAwaited: AgentSignal[];
  received: AgentSignal[];
}

export type WaitStatus = 'idle' | 'waiting';
