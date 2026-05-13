import type { AgentLivenessEvent } from '@two-pebble/protocol';
import type { LoadableRegistry } from '../../loadable';

export type AgentLivenessRecord = AgentLivenessEvent['payload'];

export interface AgentLivenessState {
  agentLiveness: LoadableRegistry<AgentLivenessRecord>;
  daemonBootId: string | null;
}
