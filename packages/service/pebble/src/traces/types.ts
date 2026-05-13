import type { PebbleAgentFailureTrace } from './agent-traces/agent-failure';
import type { PebbleAgentSuccessTrace } from './agent-traces/agent-success';
import type { PebbleAgentAssistantMessageTrace } from './agent-traces/assistant-message';
import type { PebbleAgentAssistantThinkingTrace } from './agent-traces/assistant-thinking';
import type { PebbleAgentCapabilityDeregisterTrace } from './agent-traces/capability-deregistered';
import type { PebbleAgentCapabilityExitBlockedTrace } from './agent-traces/capability-exit-blocked';
import type { PebbleAgentCapabilityHydrateTrace } from './agent-traces/capability-hydrate';
import type { PebbleAgentCapabilityRegisterTrace } from './agent-traces/capability-registered';
import type { PebbleAgentConversationThreadSnapshotTrace } from './agent-traces/conversation-thread-snapshot';
import type { PebbleAgentModelCallTrace } from './agent-traces/model-call';
import type { PebbleAgentModelCallFailureTrace } from './agent-traces/model-call-failure';
import type { PebbleAgentModelCallStartTrace } from './agent-traces/model-call-start';
import type { PebbleAgentModelCallSuccessTrace } from './agent-traces/model-call-success';
import type { PebbleAgentStateSnapshotTrace } from './agent-traces/state-snapshot';
import type { PebbleAgentSubAgentTrace } from './agent-traces/sub-agent';
import type { PebbleAgentSubAgentFailureTrace } from './agent-traces/sub-agent-failure';
import type { PebbleAgentSubAgentInvokeTrace } from './agent-traces/sub-agent-invoke';
import type { PebbleAgentSubAgentSuccessTrace } from './agent-traces/sub-agent-success';
import type { PebbleAgentSystemMessageTrace } from './agent-traces/system-message';
import type { PebbleAgentTaskAssignedTrace } from './agent-traces/task-assigned';
import type { PebbleAgentTaskListUpdateTrace } from './agent-traces/task-list-update';
import type { PebbleAgentToolTrace } from './agent-traces/tool';
import type { PebbleAgentToolCallFailureTrace } from './agent-traces/tool-call-failure';
import type { PebbleAgentToolCallRequestedTrace } from './agent-traces/tool-call-requested';
import type { PebbleAgentToolCallStartTrace } from './agent-traces/tool-call-start';
import type { PebbleAgentToolCallSuccessTrace } from './agent-traces/tool-call-success';
import type { PebbleAgentTurnStartTrace } from './agent-traces/turn-start';
import type { PebbleAgentUserMessageTrace } from './agent-traces/user-message';
import type { PebbleAgentWorktreeInitializedTrace } from './agent-traces/worktree-initialized';

export type PebbleAgentTrace =
  | PebbleAgentSuccessTrace
  | PebbleAgentFailureTrace
  | PebbleAgentAssistantMessageTrace
  | PebbleAgentAssistantThinkingTrace
  | PebbleAgentCapabilityDeregisterTrace
  | PebbleAgentCapabilityExitBlockedTrace
  | PebbleAgentCapabilityHydrateTrace
  | PebbleAgentCapabilityRegisterTrace
  | PebbleAgentConversationThreadSnapshotTrace
  | PebbleAgentModelCallFailureTrace
  | PebbleAgentModelCallStartTrace
  | PebbleAgentModelCallSuccessTrace
  | PebbleAgentModelCallTrace
  | PebbleAgentStateSnapshotTrace
  | PebbleAgentSubAgentFailureTrace
  | PebbleAgentSubAgentInvokeTrace
  | PebbleAgentSubAgentSuccessTrace
  | PebbleAgentSubAgentTrace
  | PebbleAgentSystemMessageTrace
  | PebbleAgentTaskAssignedTrace
  | PebbleAgentTaskListUpdateTrace
  | PebbleAgentToolTrace
  | PebbleAgentToolCallFailureTrace
  | PebbleAgentToolCallRequestedTrace
  | PebbleAgentToolCallStartTrace
  | PebbleAgentToolCallSuccessTrace
  | PebbleAgentTurnStartTrace
  | PebbleAgentUserMessageTrace
  | PebbleAgentWorktreeInitializedTrace;

export type PebbleAgentTraceData<TType extends PebbleAgentTrace['type'] = PebbleAgentTrace['type']> = Extract<
  PebbleAgentTrace,
  { type: TType }
>['data'];

export type PebbleAgentTraceByType = {
  [T in PebbleAgentTrace['type']]: Extract<PebbleAgentTrace, { type: T }>['data'];
};

export type PebbleAgentTraceListener = (trace: PebbleAgentTrace) => void;

export type PebbleAgentTraceListenerOrNull = PebbleAgentTraceListener | null;
