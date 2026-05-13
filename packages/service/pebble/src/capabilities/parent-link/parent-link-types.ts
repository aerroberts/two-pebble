export interface ParentLinkCapabilityConfig {
  parentAgentId?: string;
}

export interface PendingParentResponse {
  parentAgentId: string;
  parentCapabilityId: string;
  responseSignalId: string;
}
