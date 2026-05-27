import type { KnownIdeRecord } from '@two-pebble/datatypes';

export interface ListKnownIdesOperation {
  name: 'listKnownIdes';
  request: object;
  response: {
    items: KnownIdeRecord[];
  };
}
