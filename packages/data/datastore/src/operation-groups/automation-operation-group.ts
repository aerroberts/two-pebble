import type { DatastoreOperationBinder } from '../datastore-operation-binder';
import { automationsCreateOperation } from '../operations/automations.create';
import { automationsDeleteOperation } from '../operations/automations.delete';
import { automationsListOperation } from '../operations/automations.list';
import { automationsReadOperation } from '../operations/automations.read';
import { automationsRecordRunOperation } from '../operations/automations.record-run';
import { automationsUpdateOperation } from '../operations/automations.update';
import { heartbeatsInsertOperation } from '../operations/heartbeats.insert';
import { heartbeatsListOperation } from '../operations/heartbeats.list';
import { heartbeatsPruneOperation } from '../operations/heartbeats.prune';

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function bindAutomationOperationGroup(bind: DatastoreOperationBinder) {
  return {
    create: bind(automationsCreateOperation, 'automations.create'),
    delete: bind(automationsDeleteOperation, 'automations.delete'),
    list: bind(automationsListOperation, 'automations.list'),
    read: bind(automationsReadOperation, 'automations.read'),
    recordRun: bind(automationsRecordRunOperation, 'automations.record-run'),
    update: bind(automationsUpdateOperation, 'automations.update'),
  };
}

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function bindHeartbeatOperationGroup(bind: DatastoreOperationBinder) {
  return {
    insert: bind(heartbeatsInsertOperation, 'heartbeats.insert'),
    list: bind(heartbeatsListOperation, 'heartbeats.list'),
    prune: bind(heartbeatsPruneOperation, 'heartbeats.prune'),
  };
}
