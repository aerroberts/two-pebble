import type { DataCells } from '../thread';

export interface SubAgentMessage {
  content: DataCells;
  expectsReply: boolean;
  fromAgentId: string;
  label: string;
  receivedAt: number;
}

export interface SubAgentRunnerChild {
  agentId: string;
  referenceName: string;
  status?: string;
}

export interface SubAgentSpawnInput {
  referenceName: string;
  message: string;
}

export interface SubAgentSendInput {
  childAgentId: string;
  expectsReply: boolean;
  message: string;
}

export interface SubAgentAskInput {
  childAgentId: string;
  message: string;
  toolCallId: string;
}

export interface SubAgentAwaitInput {
  childAgentId: string;
  toolCallId: string;
}

export interface SubAgentDrainInput {
  childAgentId: string;
}

export interface SubAgentKillInput {
  childAgentId: string;
  reason: string;
}

export interface SubAgentRunner {
  spawn(input: SubAgentSpawnInput): Promise<string>;
  send(input: SubAgentSendInput): Promise<void>;
  ask(input: SubAgentAskInput): Promise<SubAgentMessage>;
  awaitMessage(input: SubAgentAwaitInput): Promise<SubAgentMessage>;
  drain(input: SubAgentDrainInput): SubAgentMessage[];
  kill(input: SubAgentKillInput): Promise<void>;
  list(): SubAgentRunnerChild[];
}

export interface ParentLinkNotifyInput {
  expectsReply: boolean;
  message: string;
}

export interface ParentLinkAskInput {
  message: string;
  toolCallId: string;
}

export interface ParentLinkAwaitInput {
  toolCallId: string;
}

export interface ParentLinkRunner {
  notifyParent(input: ParentLinkNotifyInput): Promise<void>;
  askParent(input: ParentLinkAskInput): Promise<SubAgentMessage>;
  awaitParentReply(input: ParentLinkAwaitInput): Promise<SubAgentMessage>;
  drainParentMessages(): SubAgentMessage[];
}
