/**
 * Thrown when a caller tries to remove a pool that still contains tasks or pools.
 * Holds the offending pool id and member count so callers can decide whether to
 * cascade-remove or reject the operation upstream.
 */
export class NonEmptyPoolError extends Error {
  public readonly memberCount: number;
  public readonly poolId: string;

  /**
   * Builds a NonEmptyPoolError annotated with the pool id and live member count.
   * The member count is the number of direct children only.
   * Cascading deletion is the caller's responsibility, not the engine's.
   */
  public constructor(poolId: string, memberCount: number) {
    super(`pool "${poolId}" still has ${memberCount} member(s); remove them before deleting the pool`);
    this.poolId = poolId;
    this.memberCount = memberCount;
    this.name = 'NonEmptyPoolError';
  }
}
