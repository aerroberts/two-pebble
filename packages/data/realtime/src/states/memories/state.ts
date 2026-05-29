import { LoadableRegistry } from '../../loadable';
import type { MemoriesState, MemoryRecord } from './types';

export function createMemoriesState(): MemoriesState {
  return {
    memories: new LoadableRegistry<MemoryRecord>(),
  };
}
