import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  empty?: never;
};

export function datastoreCloseOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    void input;
    ctx.libsqlClient.close();
    return undefined;
  };
}
