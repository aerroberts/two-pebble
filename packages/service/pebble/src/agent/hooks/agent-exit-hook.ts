import type { AgentExitHookResult } from '../types';

/**
 * The agent exit hook allows capabilties to listen for when the agent is attempting to exit.
 * The capability can prevent the agent from exiting by returning a reason, forcing the agent to continue.
 */
export const AgentExitHook = {
  permitExit(): AgentExitHookResult {
    return {
      permitExit: true,
    };
  },
  denyExit(reason: string): AgentExitHookResult {
    return {
      permitExit: false,
      reason,
    };
  },
};
