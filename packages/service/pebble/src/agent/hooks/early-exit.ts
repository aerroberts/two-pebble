export type EarlyExitHookResult = { furtherAction: false; reason: string } | { furtherAction: true; reason: string };

/**
 * A capability itself can prevent early exit by returning a reason, forcing the agent to continue.
 * If a capability allows itself to deregister early, it may be removed from the agent.
 */
export const EarlyExit = {
  possible(reason: string): EarlyExitHookResult {
    return {
      furtherAction: false,
      reason,
    };
  },
  notPossible(reason: string): EarlyExitHookResult {
    return {
      furtherAction: true,
      reason,
    };
  },
};
