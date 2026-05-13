/**
 * Thrown when adding a dependency would create a cycle in the blocker graph.
 * Holds the proposed endpoint ids so observers can render a precise message.
 * The blocker graph mixes explicit dependencies, inherited pool deps, and
 * pool-to-child containment; any reachable loop is rejected.
 */
export class CycleError extends Error {
  public readonly fromId: string;
  public readonly toId: string;

  /**
   * Builds a CycleError annotated with the proposed dependency endpoints.
   * Endpoint ids are preserved for telemetry and structured logging.
   * The message follows the form `dependency "<from>" -> "<to>" creates a cycle`.
   */
  public constructor(fromId: string, toId: string) {
    super(`dependency "${fromId}" -> "${toId}" creates a cycle`);
    this.fromId = fromId;
    this.toId = toId;
    this.name = 'CycleError';
  }
}
