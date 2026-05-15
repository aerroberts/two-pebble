export interface DocumentDeletedEvent {
  name: 'documentDeleted';
  payload: {
    id: string;
  };
}
