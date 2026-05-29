import type { DocumentTodo, DocumentTodoCompletionType, DocumentTodoStatus } from '@two-pebble/datatypes';
import type { PebbleJsonValue } from '../types';

export interface SetAgentNameInput {
  name: string;
}

export interface DocumentCreateInput {
  name: string;
  markdown: string;
  /**
   * Optional sidebar grouping label (e.g. "Specs", "Drafts"). Omit to keep
   * the document in the unsectioned default bucket. Agents typically set
   * this when generating documents into a named project area.
   */
  section?: string | null;
}

export interface DocumentUpdateInput {
  id: string;
  markdown: string;
  name?: string;
  /**
   * Optional section reassignment. `undefined` leaves the existing section
   * alone; `null` moves the document back into the unsectioned bucket; any
   * string moves it into that named section.
   */
  section?: string | null;
}

export interface DocumentReadInput {
  id: string;
}

export interface DocumentListInput {
  limit?: number;
  offset?: number;
}

export interface DocumentApplyTodoStatusInput {
  id: string;
  todoId: string;
  status: DocumentTodoStatus;
  completionType?: DocumentTodoCompletionType;
}

export interface DocumentSummary {
  id: string;
  name: string;
}

export interface DocumentReadOutput {
  id: string;
  name: string;
  markdown: string;
}

export interface DocumentListEntry {
  id: string;
  name: string;
  updatedAt: number;
}

export interface DocumentListOutput {
  items: DocumentListEntry[];
  total: number;
}

export type AgentSignalKind = 'awaited' | 'push';
export type AgentSignalStatus = 'open' | 'received' | 'resolved';

export interface AgentSignal {
  id: string;
  agentId: string;
  capabilityId: string;
  data: PebbleJsonValue;
  description: string;
  kind: AgentSignalKind;
  name: string;
  signalId: string;
  status: AgentSignalStatus;
}

export interface SignalSnapshot {
  openAwaited: AgentSignal[];
  received: AgentSignal[];
}

export interface RegisterSignalInput {
  capabilityId: string;
  description: string;
  name: string;
  signalId?: string;
}

export interface SendSignalInput {
  agentId: string;
  capabilityId: string;
  data: PebbleJsonValue;
  description: string;
  name: string;
  signalId?: string;
}

export interface ResolveSignalInput {
  agentId: string;
  capabilityId: string;
  data: PebbleJsonValue;
  signalId: string;
}

export interface SignalSnapshotInput {
  agentId: string;
}

export interface MarkSignalResolvedInput {
  id: string;
}

export interface GithubSubmitPrInput {
  deliverableId: string;
  url: string;
}

export interface GithubTrackedPr {
  id: string;
  taskId: string;
  deliverableId: string;
  repo: string;
  number: number;
  url: string;
  state: 'mergeable' | 'unmergeable' | 'merged' | 'closed';
}

export interface GithubPrSignalInput {
  prId: string;
  next: 'mergeable' | 'unmergeable' | 'merged' | 'closed';
}

export type SubAgentMode = 'task' | 'teammate';
export type SubAgentRuntime = 'framework' | 'pebble';
export type SubAgentWorkspaceMode = 'inherit' | 'worktree';

export interface SubAgentSpawnInput {
  instructions: string;
  mode: SubAgentMode;
  name: string;
  subAgentId: string;
  workspace?: SubAgentWorkspaceMode;
}

export interface SubAgentSpawnOutput {
  agentId: string;
  runtime: SubAgentRuntime;
}

export interface SubAgentSendInput {
  childAgentId: string;
  childName: string;
  instructions: string;
  mode: SubAgentMode;
}

export interface SubAgentKillInput {
  childAgentId: string;
  reason: string;
}

export type SettableTaskStatus = 'working' | 'waiting' | 'success' | 'failure' | 'canceled';
export type TaskStatus = 'pending' | SettableTaskStatus;

export interface TaskBoardPoolNode {
  id: string;
  name: string;
  parentPoolId: string | null;
}

export interface TaskBoardTaskNode {
  id: string;
  name: string;
  description: string;
  poolId: string | null;
  status: TaskStatus;
  effectiveStatus: TaskStatus | 'blocked' | 'open';
  ownerId: string | null;
}

export interface TaskBoardDependencyEdge {
  fromId: string;
  toId: string;
}

export interface TaskBoardSnapshot {
  boardId: string;
  boardName: string;
  pools: TaskBoardPoolNode[];
  tasks: TaskBoardTaskNode[];
  dependencies: TaskBoardDependencyEdge[];
}

export interface TaskBoardCreateTaskInput {
  boardId: string;
  name: string;
  description?: string;
  poolId?: string | null;
  dependsOn?: string[];
}

export interface TaskBoardRenameTaskInput {
  taskId: string;
  name: string;
}

export interface TaskBoardUpdateTaskDescriptionInput {
  boardId?: string;
  taskId: string;
  description: string;
}

export interface TaskBoardSetTaskStatusInput {
  boardId: string;
  taskId: string;
  status: SettableTaskStatus;
  reason: string;
}

export interface TaskBoardSetOwnedTaskStatusInput {
  agentId: string;
  taskId: string;
  status: SettableTaskStatus;
  reason: string;
}

export interface TaskBoardDeleteTaskInput {
  boardId: string;
  taskId: string;
}

export interface TaskBoardCreatePoolInput {
  boardId: string;
  name: string;
  parentPoolId?: string | null;
  dependsOn?: string[];
}

export interface TaskBoardDeletePoolInput {
  boardId: string;
  poolId: string;
}

export interface TaskBoardDependencyInput {
  boardId: string;
  fromTaskId: string;
  toTaskId: string;
}

export interface TaskBoardEventRecord {
  id: string;
  kind: 'status' | 'delegated' | 'undelegated' | 'comment';
  taskId: string;
  reason: string;
  createdAt: number;
  status?: TaskStatus | 'blocked' | 'open';
  agentId?: string;
  agentName?: string;
}

export type TaskDeliverablePayload = { type: 'text'; content: string } | { type: 'pr_url'; url: string };

export interface TaskBoardDeliverable {
  id: string;
  taskId: string;
  name: string;
  description: string;
  type: 'text' | 'pr_url';
  orderIndex: number;
}

export interface TaskBoardDeliverableSubmission {
  id: string;
  taskId: string;
  deliverableId: string;
  payload: TaskDeliverablePayload;
  submittedAt: number;
}

export interface TaskBoardSubmitDeliverableInput {
  agentId: string;
  taskId: string;
  deliverableId: string;
  payload: TaskDeliverablePayload;
}

export type DocumentTodoList = DocumentTodo[];

export interface AgentOperations {
  setName(input: SetAgentNameInput): Promise<void>;
}

export interface DocumentOperations {
  applyTodoStatus(input: DocumentApplyTodoStatusInput): Promise<void>;
  create(input: DocumentCreateInput): Promise<DocumentSummary>;
  list(input: DocumentListInput): Promise<DocumentListOutput>;
  read(input: DocumentReadInput): Promise<DocumentReadOutput>;
  readTodos(input: DocumentReadInput): Promise<DocumentTodoList>;
  update(input: DocumentUpdateInput): Promise<DocumentSummary>;
}

export interface SignalOperations {
  markResolved(input: MarkSignalResolvedInput): Promise<void>;
  register(input: RegisterSignalInput): Promise<string>;
  resolve(input: ResolveSignalInput): Promise<void>;
  send(input: SendSignalInput): Promise<void>;
  snapshot(input: SignalSnapshotInput): Promise<SignalSnapshot>;
}

export interface GithubOperations {
  applySignal(input: GithubPrSignalInput): Promise<void>;
  hasOpenPrs(): Promise<boolean>;
  submitPr(input: GithubSubmitPrInput): Promise<GithubTrackedPr>;
}

export interface SubAgentOperations {
  kill(input: SubAgentKillInput): Promise<void>;
  send(input: SubAgentSendInput): Promise<void>;
  spawn(input: SubAgentSpawnInput): Promise<SubAgentSpawnOutput>;
}

export interface TaskBoardOperations {
  addDependency(input: TaskBoardDependencyInput): Promise<void>;
  createPool(input: TaskBoardCreatePoolInput): Promise<{ id: string }>;
  createTask(input: TaskBoardCreateTaskInput): Promise<{ id: string }>;
  deleteDependency(input: TaskBoardDependencyInput): Promise<void>;
  deletePool(input: TaskBoardDeletePoolInput): Promise<void>;
  deleteTask(input: TaskBoardDeleteTaskInput): Promise<void>;
  describe(input: { boardId: string }): Promise<TaskBoardSnapshot>;
  listTaskDeliverableSubmissions(input: { taskId: string }): Promise<TaskBoardDeliverableSubmission[]>;
  listTaskDeliverables(input: { taskId: string }): Promise<TaskBoardDeliverable[]>;
  listTaskEvents(input: { boardId: string; taskId: string }): Promise<TaskBoardEventRecord[]>;
  renameTask(input: TaskBoardRenameTaskInput): Promise<void>;
  setOwnedTaskStatus(input: TaskBoardSetOwnedTaskStatusInput): Promise<void>;
  setTaskStatus(input: TaskBoardSetTaskStatusInput): Promise<void>;
  submitDeliverable(input: TaskBoardSubmitDeliverableInput): Promise<TaskBoardDeliverableSubmission>;
  updateTaskDescription(input: TaskBoardUpdateTaskDescriptionInput): Promise<void>;
}
