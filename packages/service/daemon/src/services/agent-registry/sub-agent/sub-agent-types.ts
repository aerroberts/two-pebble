import type { Datastore } from '@two-pebble/datastore';
import type { DataCells } from '@two-pebble/pebble';
import type { DaemonEventSink } from '../../../types';
import type { AgentRegistryService } from '../service';

export interface SubAgentCoordinatorContext {
  agentRegistry: AgentRegistryService;
  datastore: Datastore;
  events: DaemonEventSink;
}

export interface SubAgentMessage {
  content: DataCells;
  expectsReply: boolean;
  label: string;
}

export interface InboxQueues {
  byRecipient: Map<string, SubAgentMessage[]>;
}

export interface DeliverInput {
  recipientAgentId: string;
  message: SubAgentMessage;
}

export interface AwaitNextInput {
  recipientAgentId: string;
}

export interface DrainInput {
  recipientAgentId: string;
}

export type SubAgentMessageWaiter = (message: SubAgentMessage) => void;

export interface AgentTerminateInput {
  agentId: string;
  reason: string;
}

export type SubAgentReferenceMap = ReadonlyMap<string, string>;
