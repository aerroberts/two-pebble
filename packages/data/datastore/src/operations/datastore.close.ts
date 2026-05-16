import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  empty?: never;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function datastoreCloseOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    void input;
    ctx.libsqlClient.close();
    return undefined;
  };
}
