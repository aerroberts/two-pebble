import type { DaemonHandlerContext } from '../types';

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler() {
    return ctx.datastore.projects.list({});
  };
}
