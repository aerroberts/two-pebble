import { count } from 'drizzle-orm';
import type { DatastoreContext } from '../types';
import { attachInferenceProfileProviders } from '../operation-support/inference-profiles-utils';

type OperationHandlerInput = {
  limit: number;
  offset: number;
};

export function inferenceProfilesListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.inferenceProfilesTable)
      .orderBy(ctx.schema.inferenceProfilesTable.name)
      .limit(input.limit)
      .offset(input.offset)
      .all();
    const total =
      (await ctx.database.select({ value: count() }).from(ctx.schema.inferenceProfilesTable).get())?.value ?? 0;

    return {
      items: await attachInferenceProfileProviders(ctx, rows),
      page: {
        limit: input.limit,
        offset: input.offset,
        total,
      },
    };
  };
}
