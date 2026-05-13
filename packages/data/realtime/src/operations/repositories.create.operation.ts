import type { CreateRepositoryInput, CreateRepositoryResponse } from '../states/repositories/types';
import type { RealtimeOperationContext } from '../types';

export function createRepositoryOperation(ctx: RealtimeOperationContext) {
  return async function createRepository(payload: CreateRepositoryInput): Promise<CreateRepositoryResponse> {
    return ctx.datastore.emit('createRepository', payload);
  };
}
