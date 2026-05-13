import type { Datastore } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { ProbeResult } from '@two-pebble/pebble';
import type { AgentLivenessEvent } from '@two-pebble/protocol';
import type { AgentRegistryService } from './agent-registry-service';

export type LivenessPayload = AgentLivenessEvent['payload'];

export type LivenessState = LivenessPayload['state'];

export type LivenessBroadcaster = (payload: LivenessPayload) => void;

export type LivenessTimer = ReturnType<typeof setInterval>;

export interface LivenessReconcilerInput {
  agentRegistry: AgentRegistryService;
  broadcast: LivenessBroadcaster;
  daemonBootId: string;
  datastore: Datastore;
  logger: Logger;
}

export interface ProbeableAgent {
  probe(): Promise<ProbeResult>;
}
