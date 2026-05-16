import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentId: string;
  completedAt: number;
  data: object;
  errorMessage: string;
  id: string;
  modelId: string;
  provider: string;
  startedAt: number;
  status: 'in_progress' | 'completed' | 'failed';
  threadCellPointer: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentCallsRecordOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    await ctx.database
      .insert(ctx.schema.agentCallsTable)
      .values({
        agentId: input.agentId,
        completedAt: input.completedAt,
        data: input.data,
        errorMessage: input.errorMessage,
        id: input.id,
        modelId: input.modelId,
        provider: input.provider,
        startedAt: input.startedAt,
        status: input.status,
        threadCellPointer: input.threadCellPointer,
      })
      .returning()
      .get();

    return {
      agentId: input.agentId,
      completedAt: input.completedAt,
      data: input.data,
      errorMessage: input.errorMessage,
      id: input.id,
      modelId: input.modelId,
      provider: input.provider,
      startedAt: input.startedAt,
      status: input.status,
      threadCellPointer: input.threadCellPointer,
    };
  };
}
