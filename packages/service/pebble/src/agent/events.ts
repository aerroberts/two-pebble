import type { PricingLineItem } from '../pricing/types';
import type { ProviderResult } from '../providers/types';
import type { DataCells } from '../thread';
import type { PebbleAgentTrace } from '../traces/types';
import type { PebbleJsonRecord } from '../types';
import type {
  AgentStatusEvent,
  PebbleAgentConversationCell,
  SubAgentLifecycleEvent,
  SubAgentTraceEvent,
  SubAgentUsageEvent,
} from './types';

export interface AgentFinalMessageEvent {
  content: DataCells;
}

/**
 * Agents have a whole event based lifecycle which can be tied into that are emitted by the agent to be tracked in the system
 */
export type AgentEvents = {
  // Emitted whenever a model call is made, with details of the content of the call request and response
  modelCall: [ProviderResult];

  // Emitted whenever a pricing line item is recorded, this represents a singular atomic cost incurred by the agent
  lineItem: [PricingLineItem];

  // The agent has a lifecyle it progressed through, this is emitted whenever the status changes from one state to another
  status: [AgentStatusEvent];

  // Emitted internally when caller-supplied user messages are available to drain.
  message: [];

  // Emitted whenever the agent produces a settled outgoing message — for
  // framework agents, the last assistant message of the turn that just
  // ended; for Pebble agents, the model's final user-facing reply. This is
  // the actionable surface for consumers that want to react to what the
  // agent said (traces are debug-only).
  finalMessage: [AgentFinalMessageEvent];

  // A trace is a developer facing event which indicates that something happened as part of agent execution
  // Traces track everything from user messages, to model calls, to tool use. They are the main source of data powering the UI
  trace: [PebbleAgentTrace];

  // A thread message is a single message being added to the conversation thread
  // Conversations are the raw context a model uses to understand the world
  threadMessage: [PebbleAgentConversationCell];

  // Framework adapters may publish resumability metadata.
  metadata: [PebbleJsonRecord];

  // Framework-owned sub-agent events are forwarded through the same emitter.
  subAgentStart: [SubAgentLifecycleEvent];
  subAgentStop: [SubAgentLifecycleEvent];
  subAgentTrace: [SubAgentTraceEvent];
  subAgentUsage: [SubAgentUsageEvent];
};
