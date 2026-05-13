import type { Datastore } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { SubAgentMessage } from '@two-pebble/pebble';
import type { DaemonBridge } from '../../types';
import type { AgentRegistryService } from '../agent-registry-service';
import type { SubAgentCoordinator } from './sub-agent-coordinator';

export interface SubAgentCoordinatorContext {
  agentRegistry: AgentRegistryService;
  bridge: DaemonBridge;
  datastore: Datastore;
  logger: Logger;
}

export interface InboxQueues {
  byRecipient: Map<string, SubAgentMessage[]>;
}

export interface ParentRunnerContext {
  agentRegistry: AgentRegistryService;
  bridge: DaemonBridge;
  coordinator: SubAgentCoordinator;
  logger: Logger;
  parentAgentId: string;
  references: SubAgentReferenceMap;
}

export interface ChildRunnerContext {
  childAgentId: string;
  coordinator: SubAgentCoordinator;
  parentAgentId: string;
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

export interface PeerMessageEnvelope {
  expectsReply: boolean;
  label: string;
}

export type SubAgentReferenceMap = ReadonlyMap<string, string>;
