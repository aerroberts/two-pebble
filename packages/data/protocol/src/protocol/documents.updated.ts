export interface DocumentUpdatedEvent {
  name: 'documentUpdated';
  payload: DocumentRecord;
}

export interface DocumentRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  content: string;
}
