import type {
  AgentOperations,
  DocumentOperations,
  GithubOperations,
  SignalOperations,
  SubAgentOperations,
  TaskBoardOperations,
} from './operations';

export interface AgentBridge {
  agent: AgentOperations;
  documents: DocumentOperations;
  github: GithubOperations;
  signals: SignalOperations;
  subAgents: SubAgentOperations;
  taskBoards: TaskBoardOperations;
}
