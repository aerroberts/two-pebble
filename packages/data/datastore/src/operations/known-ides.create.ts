import type { DatastoreContext, KnownIdeRecord } from '../types';

const validIdeKinds = new Set(['vscode', 'zed', 'cursor', 'other']);

type OperationHandlerInput = {
  kind: string;
  displayName: string;
  executablePath: string;
};

export function knownIdesCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    if (!validIdeKinds.has(input.kind)) {
      throw new Error(`Unknown IDE kind: ${input.kind}`);
    }

    const row = await ctx.database
      .insert(ctx.schema.knownIdesTable)
      .values({
        kind: input.kind,
        displayName: input.displayName,
        executablePath: input.executablePath,
      })
      .returning()
      .get();

    return row as KnownIdeRecord;
  };
}
