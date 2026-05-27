import type { KnownIde } from '@two-pebble/datatypes';

export interface DetectIdesOperation {
  name: 'detectIdes';
  request: object;
  response: {
    candidates: KnownIde[];
  };
}
