import type { Datastore } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { Agent } from '@two-pebble/pebble';
import type { TaskBoardService } from '../task-board/service';
import { recordConversationCell, recordModelCall, recordPriceLineItem } from './recording';
import { persistAgentStatus } from './status';
import type { SubAgentCreatePromiseMap } from './sub-agents';
import { recordAgentTrace } from './traces';
import type { AgentListenerContext } from './types';

interface BuildAgentListenerContextInput {
  activeAgents: Map<string, Agent>;
  datastore: Datastore;
  logger: Logger;
  pending: SubAgentCreatePromiseMap;
  taskBoards: TaskBoardService;
  onStatusPersisted?: (
    agentId: string,
    status: 'idle' | 'running' | 'waiting' | 'interrupted' | 'offline' | 'failed',
  ) => void;
}

/**
 * Builds the persistence listener context used by runtime agents.
 */
export function buildAgentListenerContext(input: BuildAgentListenerContextInput): AgentListenerContext {
  return {
    datastore: input.datastore,
    logger: input.logger,
    pending: input.pending,
    taskBoards: input.taskBoards,
    persistAgentStatus: (statusInput) =>
      persistAgentStatus({
        ...statusInput,
        activeAgents: input.activeAgents,
        datastore: input.datastore,
        logger: input.logger,
        taskBoards: input.taskBoards,
        ...(input.onStatusPersisted === undefined ? {} : { onStatusPersisted: input.onStatusPersisted }),
      }),
    recordConversationCell: (cellInput) => recordConversationCell(input.datastore, cellInput),
    recordModelCall: (callInput) => recordModelCall(input.datastore, callInput),
    recordPriceLineItem: (priceInput) => recordPriceLineItem(input.datastore, priceInput),
    recordTrace: (traceInput) =>
      recordAgentTrace({
        ...traceInput,
        datastore: input.datastore,
        pending: input.pending,
      }),
  };
}
