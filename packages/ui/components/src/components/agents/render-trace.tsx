import { AgentFailureTrace } from './agent-failure';
import { AgentSuccessTrace } from './agent-success';
import { AssistantMessageTrace } from './assistant-message';
import { AssistantThinkingTrace } from './assistant-thinking';
import { CapabilityDeregisterTrace } from './capability-deregister';
import { CapabilityExitBlockedTrace } from './capability-exit-blocked';
import { CapabilityHydrateTrace } from './capability-hydrate';
import { CapabilityRegisterTrace } from './capability-register';
import { ConversationThreadSnapshotTrace } from './conversation-thread-snapshot';
import { DocumentCreatedTrace } from './document-created';
import { DocumentUpdatedTrace } from './document-updated';
import { ModelCallFailureTrace } from './model-call-failure';
import { ModelCallStartTrace } from './model-call-start';
import { ModelCallSuccessTrace } from './model-call-success';
import { ParentMessageTrace } from './parent-message';
import { AgentWaitingTrace, SignalReceivedTrace, SignalRegisteredTrace, SignalResolvedTrace } from './signal-trace';
import { StateSnapshotTrace } from './state-snapshot';
import { SubAgentTrace } from './sub-agent';
import { SystemMessageTrace } from './system-message';
import { TaskAssignedTrace } from './task-assigned';
import { TaskListUpdateTrace } from './task-list-update';
import { ToolTrace } from './tool';
import { ToolCallFailureTrace } from './tool-call-failure';
import { ToolCallRequestedTrace } from './tool-call-requested';
import { ToolCallStartTrace } from './tool-call-start';
import { ToolCallSuccessTrace } from './tool-call-success';
import { TurnStartTrace } from './turn-start';
import type { AgentTraceRecord, AgentTraceRenderOptions } from './types';
import { UserMessageTrace } from './user-message';
import { WorktreeInitializedTrace } from './worktree-initialized';

export function renderAgentTrace(trace: AgentTraceRecord, options: AgentTraceRenderOptions) {
  switch (trace.type) {
    case 'agent-failure':
      return <AgentFailureTrace trace={trace} />;
    case 'agent-success':
      return <AgentSuccessTrace trace={trace} />;
    case 'assistant-message':
      return <AssistantMessageTrace trace={trace} speakController={options.speakController} />;
    case 'assistant-thinking':
      return <AssistantThinkingTrace trace={trace} />;
    case 'capability-deregister':
      return <CapabilityDeregisterTrace trace={trace} />;
    case 'capability-exit-blocked':
      return <CapabilityExitBlockedTrace trace={trace} />;
    case 'capability-hydrate':
      return <CapabilityHydrateTrace trace={trace} />;
    case 'capability-register':
      return <CapabilityRegisterTrace trace={trace} />;
    case 'conversation-thread-snapshot':
      return <ConversationThreadSnapshotTrace trace={trace} onThreadSnapshotClick={options.onThreadSnapshotClick} />;
    case 'document-created':
      return <DocumentCreatedTrace trace={trace} onDocumentClick={options.onDocumentClick} />;
    case 'document-updated':
      return <DocumentUpdatedTrace trace={trace} onDocumentClick={options.onDocumentClick} />;
    case 'model-call-failure':
      return <ModelCallFailureTrace trace={trace} onModelCallClick={options.onModelCallClick} />;
    case 'model-call-start':
      return <ModelCallStartTrace trace={trace} />;
    case 'model-call-success':
      return <ModelCallSuccessTrace trace={trace} onModelCallClick={options.onModelCallClick} />;
    case 'parent-message':
      return <ParentMessageTrace trace={trace} />;
    case 'signal-received':
      return <SignalReceivedTrace trace={trace} />;
    case 'signal-registered':
      return <SignalRegisteredTrace trace={trace} />;
    case 'signal-resolved':
      return <SignalResolvedTrace trace={trace} />;
    case 'agent-waiting':
      return <AgentWaitingTrace trace={trace} />;
    case 'state-snapshot':
      return <StateSnapshotTrace trace={trace} />;
    case 'sub-agent':
      return <SubAgentTrace trace={trace} onAgentClick={options.onAgentClick} />;
    case 'sub-agent-failure':
      return null;
    case 'sub-agent-invoke':
      return null;
    case 'sub-agent-success':
      return null;
    case 'system-message':
      return <SystemMessageTrace trace={trace} />;
    case 'task-assigned':
      return <TaskAssignedTrace trace={trace} onTaskClick={options.onTaskClick} />;
    case 'task-list-update':
      return <TaskListUpdateTrace trace={trace} />;
    case 'tool':
      return <ToolTrace trace={trace} />;
    case 'tool-call-failure':
      return <ToolCallFailureTrace trace={trace} />;
    case 'tool-call-requested':
      return <ToolCallRequestedTrace trace={trace} />;
    case 'tool-call-start':
      return <ToolCallStartTrace trace={trace} />;
    case 'tool-call-success':
      return <ToolCallSuccessTrace trace={trace} />;
    case 'turn-start':
      return <TurnStartTrace trace={trace} />;
    case 'user-message':
      return (
        <UserMessageTrace
          trace={trace}
          speakController={options.speakController}
          getBoardHref={options.getBoardHref}
          getDocumentHref={options.getDocumentHref}
        />
      );
    case 'worktree-initialized':
      return <WorktreeInitializedTrace trace={trace} onWorktreeOpenClick={options.onWorktreeOpenClick} />;
  }
}
