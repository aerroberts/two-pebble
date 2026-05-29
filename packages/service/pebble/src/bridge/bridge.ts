import type {
  AgentOperations,
  DocumentOperations,
  GithubOperations,
  MemoryOperations,
  SignalOperations,
  SubAgentOperations,
  TaskBoardOperations,
} from './operations';

export interface AgentBridge {
  agent: AgentOperations;
  documents: DocumentOperations;
  github: GithubOperations;
  memories: MemoryOperations;
  signals: SignalOperations;
  subAgents: SubAgentOperations;
  taskBoards: TaskBoardOperations;
}
