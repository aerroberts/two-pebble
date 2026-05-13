export interface AgentEventWithoutTimestamp {
  type: string;
  data: unknown;
}

export type ClaudeCodePostToolUseEvent = AgentEventWithoutTimestamp;
export type ClaudeCodePostToolUseFailureEvent = AgentEventWithoutTimestamp;
export type ClaudeCodePreToolUseEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeToolProgressEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeAssistantMessageEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeCompactBoundaryEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeElicitationResultEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeLifecycleEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeRuntimeEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeSystemMessageEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeTaskEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeTaskListEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeTaskListUpdateEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeTextMessageEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeUsageEvent = AgentEventWithoutTimestamp;

export namespace AgentTrace {
  export type MessageContent = { type: 'text'; content: string } | { type: 'image'; base64: string };
  export type MessageBlock = string | MessageContent[];
  export interface BaseEvent<TData extends object = Record<string, unknown>> {
    type: string;
    timestamp: number;
    data: TData;
  }

  export type CachePointEvent = BaseEvent;
  export interface CapabilityDeregisteredEvent extends BaseEvent {
    data: {
      capabilityName: string;
      reason: string;
      toolNames: string[];
    };
  }
  export interface CapabilityRegisteredEvent extends BaseEvent {
    data: {
      capabilityName: string;
      description?: string;
      tools: Array<{
        toolName: string;
        toolType: 'cli' | 'framework' | 'native';
        description: string;
        inputSchema?: object;
        outputSchema?: object;
      }>;
    };
  }
  export interface LLMModelCallEvent extends BaseEvent {
    data: {
      modelCallId: string;
      provider: string;
      modelId: string;
      durationMs: number;
      status: string;
      error?: string;
    };
  }
  export interface MessageAgentEvent extends BaseEvent {
    data: { content: MessageBlock };
  }
  export type MessageThinkingEvent = MessageAgentEvent;
  export type MessageUserEvent = MessageAgentEvent;
  export type SystemPromptEvent = MessageAgentEvent;
  export interface SystemExitErrorEvent extends BaseEvent {
    data: { reason: string };
  }
  export type SystemExitSuccessEvent = SystemExitErrorEvent;
  export interface ToolEvent extends BaseEvent {
    data: {
      toolName: string;
      callId?: string;
      toolType?: 'cli' | 'framework' | 'native';
      input: unknown;
      status: 'pending' | 'success' | 'error';
      duration: number;
      result?: unknown;
      error?: unknown;
    };
  }
  export interface WorkspaceInitializedEvent extends BaseEvent {
    data: {
      sandboxId: string;
      workspaceId: string;
      workspacePath: string;
      fileTree: string;
      fileReferences: Array<{ path: string; content: string }>;
      driveMounts: Array<{ driveId: string; mountPath: string; prompt: string }>;
    };
  }
}
export type ClaudeCodeApiRetryEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeAuthStatusEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeConfigChangeEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeCwdChangedEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeElicitationCompleteEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeElicitationEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeFileChangedEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeFilesPersistedEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeGenericEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeHookProgressEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeHookResponseEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeHookStartedEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeInitEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeInstructionsLoadedEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeLocalCommandOutputEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeMemoryRecallEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeNotificationEvent = AgentEventWithoutTimestamp;
export type ClaudeCodePermissionDeniedEvent = AgentEventWithoutTimestamp;
export type ClaudeCodePermissionRequestEvent = AgentEventWithoutTimestamp;
export type ClaudeCodePluginInstallEvent = AgentEventWithoutTimestamp;
export type ClaudeCodePostCompactEvent = AgentEventWithoutTimestamp;
export type ClaudeCodePreCompactEvent = AgentEventWithoutTimestamp;
export type ClaudeCodePromptSuggestionEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeRateLimitEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeResultErrorEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeResultEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeResultSuccessEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeSessionEndEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeSessionStartEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeSessionStateChangedEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeSetupEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeStatusEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeStopEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeStopFailureEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeSubagentStartEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeSubagentStopEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeTaskCompletedEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeTaskCreatedEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeTaskNotificationEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeTaskProgressEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeTaskStartedEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeTaskUpdatedEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeTeammateIdleEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeToolUseSummaryEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeUserPromptSubmitEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeWorktreeCreateEvent = AgentEventWithoutTimestamp;
export type ClaudeCodeWorktreeRemoveEvent = AgentEventWithoutTimestamp;
