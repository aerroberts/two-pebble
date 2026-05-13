import type { Datastore } from '@two-pebble/datastore';

export type WakeAgentFromSignal = (agentId: string) => Promise<void>;

export interface DaemonSignalRunnerContext {
  agentId: string;
  datastore: Datastore;
  wake: WakeAgentFromSignal;
}
