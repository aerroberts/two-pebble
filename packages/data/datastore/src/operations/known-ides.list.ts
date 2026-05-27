import type { DatastoreContext, KnownIdeRecord } from '../types';

type OperationHandlerInput = {
  readonly __noInput?: never;
};

export function knownIdesListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    void input;
    const rows = await ctx.database
      .select()
      .from(ctx.schema.knownIdesTable)
      .orderBy(ctx.schema.knownIdesTable.displayName)
      .all();

    return { items: rows as KnownIdeRecord[] };
  };
}
