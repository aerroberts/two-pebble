import type { LoadableRegistry } from '../../loadable';
import type { RealtimeEmitPayload, RealtimeEmitResponse } from '../../types';

export interface MemoriesState {
  memories: LoadableRegistry<MemoryRecord>;
}

export type CreateMemoryInput = RealtimeEmitPayload<'createMemory'>;
export type CreateMemoryResponse = RealtimeEmitResponse<'createMemory'>;
export type ReadMemoryInput = RealtimeEmitPayload<'readMemory'>;
export type DeleteMemoryInput = RealtimeEmitPayload<'deleteMemory'>;
export type MemoryRecord = RealtimeEmitResponse<'listMemories'>['items'][number];
