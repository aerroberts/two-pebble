import type { DocumentRecord } from './documents.list';

export interface DocumentUpdatedEvent {
  name: 'documentUpdated';
  payload: DocumentRecord;
}
