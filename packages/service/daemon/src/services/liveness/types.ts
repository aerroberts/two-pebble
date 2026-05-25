import type { ProbeResult } from '@two-pebble/pebble';
import type { AgentLivenessEvent } from '@two-pebble/protocol';

export type LivenessPayload = AgentLivenessEvent['payload'];

export type LivenessState = LivenessPayload['state'];

export type LivenessTimer = ReturnType<typeof setInterval>;

export interface ProbeableAgent {
  probe(): Promise<ProbeResult>;
}
