import type { KnownIde, KnownIdeRecord } from '@two-pebble/datatypes';

export interface CreateKnownIdeOperation {
  name: 'createKnownIde';
  request: KnownIde;
  response: KnownIdeRecord;
}
