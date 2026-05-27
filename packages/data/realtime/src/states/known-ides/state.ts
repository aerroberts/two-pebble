import { LoadableRegistry } from '../../loadable';
import type { KnownIdeRecord, KnownIdesState } from './types';

export function createKnownIdesState(): KnownIdesState {
  return {
    knownIdes: new LoadableRegistry<KnownIdeRecord>(),
  };
}
