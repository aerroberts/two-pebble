import type { Datastore } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { Agent } from '@two-pebble/pebble';
import { recordConversationCell, recordModelCall, recordPriceLineItem } from './agent-recording';
import { persistAgentStatus } from './agent-registry-status';
import type { SubAgentCreatePromiseMap } from './agent-registry-sub-agents';
import { recordAgentTrace } from './agent-registry-traces';
import type { AgentListenerContext } from './agent-registry-types';
import type { TaskBoardService } from './task-board-service';

interface BuildAgentListenerContextInput {
  activeAgents: Map<string, Agent>;
  datastore: Datastore;
  logger: Logger;
  pending: SubAgentCreatePromiseMap;
  taskBoards: TaskBoardService;
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
