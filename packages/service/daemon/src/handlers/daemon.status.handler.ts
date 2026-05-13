import type { DaemonHandlerContext } from '../types';

/**
 * Returns a snapshot of the daemon's runtime state.
 * Tooling uses this to discover which port is which and to route tool calls
 * to the daemon that actually owns a given agent id.
 */
export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler() {
    return {
      port: ctx.port,
      activeAgentIds: ctx.agentRegistry.listActiveAgentIds(),
    };
  };
}
