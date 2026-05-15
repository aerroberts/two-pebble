import type { DatastoreOperationBinder } from '../datastore-operation-binder';
import { agentCallsListOperation } from '../operations/agent.calls.list';
import { agentCallsReadOperation } from '../operations/agent.calls.read';
import { agentCallsRecordOperation } from '../operations/agent.calls.record';
import { agentCompleteOperation } from '../operations/agent.complete';
import { agentConversationCellsRecordOperation } from '../operations/agent.conversation.cells.record';
import { agentConversationCellsSnapshotOperation } from '../operations/agent.conversation.cells.snapshot';
import { agentCreateOperation } from '../operations/agent.create';
import { agentFailOperation } from '../operations/agent.fail';
import { agentListOperation } from '../operations/agent.list';
import { agentPriceLineItemsListOperation } from '../operations/agent.price-line-items.list';
import { agentPriceLineItemsRecordOperation } from '../operations/agent.price-line-items.record';
import { agentReadOperation } from '../operations/agent.read';
import { agentRenameOperation } from '../operations/agent.rename';
import { agentSetMetadataOperation } from '../operations/agent.set-metadata';
import { agentSetParentResponseSignalIdOperation } from '../operations/agent.set-parent-response-signal-id';
import { agentSetStatusOperation } from '../operations/agent.set-status';
import { agentSignalsListForAgentOperation } from '../operations/agent.signals.list-for-agent';
import { agentSignalsListOpenForAgentOperation } from '../operations/agent.signals.list-open-for-agent';
import { agentSignalsListReceivedForAgentOperation } from '../operations/agent.signals.list-received-for-agent';
import { agentSignalsMarkResolvedOperation } from '../operations/agent.signals.mark-resolved';
import { agentSignalsRegisterOperation } from '../operations/agent.signals.register';
import { agentSignalsResolveOperation } from '../operations/agent.signals.resolve';
import { agentSignalsSendPushOperation } from '../operations/agent.signals.send-push';
import { agentTracesListOperation } from '../operations/agent.traces.list';
import { agentTracesListByTypeOperation } from '../operations/agent.traces.list-by-type';
import { agentTracesRecordOperation } from '../operations/agent.traces.record';

/**
 * Binds agent-scoped datastore operations.
 *
 * The datastore owns wrapping; this module owns the public agent catalog.
 */
export function bindAgentOperationGroup(bind: DatastoreOperationBinder) {
  return {
    calls: {
      list: bind(agentCallsListOperation, 'agent.calls.list'),
      read: bind(agentCallsReadOperation, 'agent.calls.read'),
      record: bind(agentCallsRecordOperation, 'agent.calls.record'),
    },
    complete: bind(agentCompleteOperation, 'agent.complete'),
    conversationCells: {
      record: bind(agentConversationCellsRecordOperation, 'agent.conversation-cells.record'),
      snapshot: bind(agentConversationCellsSnapshotOperation, 'agent.conversation-cells.snapshot'),
    },
    create: bind(agentCreateOperation, 'agent.create'),
    fail: bind(agentFailOperation, 'agent.fail'),
    list: bind(agentListOperation, 'agent.list'),
    setMetadata: bind(agentSetMetadataOperation, 'agent.set-metadata'),
    setParentResponseSignalId: bind(agentSetParentResponseSignalIdOperation, 'agent.set-parent-response-signal-id'),
    setStatus: bind(agentSetStatusOperation, 'agent.set-status'),
    signals: {
      listForAgent: bind(agentSignalsListForAgentOperation, 'agent.signals.list-for-agent'),
      listOpenForAgent: bind(agentSignalsListOpenForAgentOperation, 'agent.signals.list-open-for-agent'),
      listReceivedForAgent: bind(agentSignalsListReceivedForAgentOperation, 'agent.signals.list-received-for-agent'),
      markResolved: bind(agentSignalsMarkResolvedOperation, 'agent.signals.mark-resolved'),
      register: bind(agentSignalsRegisterOperation, 'agent.signals.register'),
      resolve: bind(agentSignalsResolveOperation, 'agent.signals.resolve'),
      sendPush: bind(agentSignalsSendPushOperation, 'agent.signals.send-push'),
    },
    priceLineItems: {
      list: bind(agentPriceLineItemsListOperation, 'agent.price-line-items.list'),
      record: bind(agentPriceLineItemsRecordOperation, 'agent.price-line-items.record'),
    },
    read: bind(agentReadOperation, 'agent.read'),
    rename: bind(agentRenameOperation, 'agent.rename'),
    traces: {
      list: bind(agentTracesListOperation, 'agent.traces.list'),
      listByType: bind(agentTracesListByTypeOperation, 'agent.traces.list-by-type'),
      record: bind(agentTracesRecordOperation, 'agent.traces.record'),
    },
  };
}
