import { AgentFailureTrace } from './agent-failure';
import { AgentSuccessTrace } from './agent-success';
import { AssistantMessageTrace } from './assistant-message';
import { AssistantThinkingTrace } from './assistant-thinking';
import { CapabilityDeregisterTrace } from './capability-deregister';
import { CapabilityExitBlockedTrace } from './capability-exit-blocked';
import { CapabilityRegisterTrace } from './capability-register';
import { ConversationThreadSnapshotTrace } from './conversation-thread-snapshot';
import { ModelCallFailureTrace } from './model-call-failure';
import { ModelCallStartTrace } from './model-call-start';
import { ModelCallSuccessTrace } from './model-call-success';
import { ParentMessageTrace } from './parent-message';
import { StateSnapshotTrace } from './state-snapshot';
import { SubAgentTrace } from './sub-agent';
import { SystemMessageTrace } from './system-message';
import { TaskAssignedTrace } from './task-assigned';
import { TaskListUpdateTrace } from './task-list-update';
import { ToolTrace } from './tool';
import { ToolCallFailureTrace } from './tool-call-failure';
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
    case 'capability-register':
      return <CapabilityRegisterTrace trace={trace} />;
    case 'conversation-thread-snapshot':
      return <ConversationThreadSnapshotTrace trace={trace} onThreadSnapshotClick={options.onThreadSnapshotClick} />;
    case 'model-call-failure':
      return <ModelCallFailureTrace trace={trace} onModelCallClick={options.onModelCallClick} />;
    case 'model-call-start':
      return <ModelCallStartTrace trace={trace} />;
    case 'model-call-success':
      return <ModelCallSuccessTrace trace={trace} onModelCallClick={options.onModelCallClick} />;
    case 'parent-message':
      return <ParentMessageTrace trace={trace} />;
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
    case 'tool-call-start':
      return <ToolCallStartTrace trace={trace} />;
    case 'tool-call-success':
      return <ToolCallSuccessTrace trace={trace} />;
    case 'turn-start':
      return <TurnStartTrace trace={trace} />;
    case 'user-message':
      return <UserMessageTrace trace={trace} speakController={options.speakController} />;
    case 'worktree-initialized':
      return <WorktreeInitializedTrace trace={trace} onWorktreeOpenClick={options.onWorktreeOpenClick} />;
  }
}
