export interface KnownIdeDeletedEvent {
  name: 'knownIdeDeleted';
  payload: {
    id: string;
  };
}
