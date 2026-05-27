import type { KnownIdeRecord } from '@two-pebble/datatypes';

export interface KnownIdeUpdatedEvent {
  name: 'knownIdeUpdated';
  payload: KnownIdeRecord;
}
