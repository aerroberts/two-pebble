import type {
  AgentOperations,
  DocumentOperations,
  SignalOperations,
  SubAgentOperations,
  TaskBoardOperations,
} from './operations';

export interface AgentBridge {
  agent: AgentOperations;
  documents: DocumentOperations;
  signals: SignalOperations;
  subAgents: SubAgentOperations;
  taskBoards: TaskBoardOperations;
}
