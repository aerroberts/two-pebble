import type {
  PebbleAgentAggregatedTrace as AgentAggregatedRuntimeTrace,
  PebbleAgentTrace as AgentRuntimeTrace,
} from '@two-pebble/pebble';

type AgentTraceRecordMetadata = {
  agentId?: string;
  createdAt: number;
  id: string;
  orderId: number;
};

export type AgentTraceRecord = AgentRuntimeTrace extends infer Trace
  ? Trace extends AgentRuntimeTrace
    ? Trace & AgentTraceRecordMetadata
    : never
  : never;

export type AgentAggregatedTraceRecord = AgentAggregatedRuntimeTrace<AgentTraceRecord>;

export type AgentTraceByType<TType extends AgentAggregatedTraceRecord['type']> = Extract<
  AgentAggregatedTraceRecord,
  { type: TType }
>;

export type SpeakControllerState = 'idle' | 'loading' | 'playing';

export interface SpeakController {
  state: SpeakControllerState;
  activeText: string | null;
  start: (text: string) => void;
  stop: () => void;
}

export interface AgentTraceRenderOptions {
  onAgentClick?: (agentId: string) => void;
  onModelCallClick?: (modelCallId: string) => void;
  speakController?: SpeakController;
  onTaskClick?: (boardId: string, taskId: string) => void;
  onThreadSnapshotClick?: (threadCursor: string) => void;
  onWorktreeOpenClick?: (worktreeId: string) => void;
  onDocumentClick?: (documentId: string) => void;
  getBoardHref?: (boardId: string) => string;
  getDocumentHref?: (documentId: string) => string;
}

export interface TraceComponentProps<TType extends AgentRuntimeTrace['type']> {
  onAgentClick?: (agentId: string) => void;
  onModelCallClick?: (modelCallId: string) => void;
  speakController?: SpeakController;
  onTaskClick?: (boardId: string, taskId: string) => void;
  onThreadSnapshotClick?: (threadCursor: string) => void;
  onWorktreeOpenClick?: (worktreeId: string) => void;
  onDocumentClick?: (documentId: string) => void;
  getBoardHref?: (boardId: string) => string;
  getDocumentHref?: (documentId: string) => string;
  trace: AgentTraceByType<TType>;
}
