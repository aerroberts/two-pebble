import type { DatastoreOperationBinder } from '../datastore-operation-binder';
import { documentsCreateOperation } from '../operations/documents.create';
import { documentsDeleteOperation } from '../operations/documents.delete';
import { documentsListOperation } from '../operations/documents.list';
import { documentsReadOperation } from '../operations/documents.read';
import { documentsUpdateOperation } from '../operations/documents.update';

/**
 * Binds document persistence handlers.
 *
 * Documents are singleton rows whose content is serialized TipTap JSON.
 */
export function bindDocumentOperationGroup(bind: DatastoreOperationBinder) {
  return {
    create: bind(documentsCreateOperation, 'documents.create'),
    delete: bind(documentsDeleteOperation, 'documents.delete'),
    list: bind(documentsListOperation, 'documents.list'),
    read: bind(documentsReadOperation, 'documents.read'),
    update: bind(documentsUpdateOperation, 'documents.update'),
  };
}
