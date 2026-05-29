import type { DatastoreContext, MemoryRecord } from '../types';

type OperationHandlerInput = {
  id?: string;
  name: string;
  path: string;
  projectId?: string;
};

/**
 * Inserts a memory collection row. The caller supplies the stored `path` so
 * creation is a single write. Pure DB; the folder is created by the daemon
 * handler that orchestrates this call.
 */
export function memoriesCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.memoriesTable)
      .values({
        name: input.name,
        path: input.path,
        projectId: input.projectId ?? 'proj_default',
        ...(input.id === undefined ? {} : { id: input.id }),
      })
      .returning()
      .get();

    return row as MemoryRecord;
  };
}
