import type { DependencyRecord, ParentId } from './types';

/**
 * Owns dependency edges plus the containment index used by cycle detection.
 * Tracks which entities are pools so it can include pool-to-child containment
 * edges when traversing the blocker graph.
 * Pure data + reachability logic; no validation, no events.
 */
export class BlockerGraph {
  private readonly parentByEntityId = new Map<string, ParentId>();
  private readonly childrenByPoolId = new Map<string, Set<string>>();
  private readonly outgoingByFromId = new Map<string, Set<string>>();
  private readonly incomingByToId = new Map<string, Set<string>>();
  private readonly poolIds = new Set<string>();

  /**
   * Registers a new entity in the graph along with its container.
   * The kind flag drives whether containment edges include this entity's
   * direct children when computing blockers.
   */
  public registerEntity(id: string, parentId: ParentId, isPool: boolean): void {
    this.parentByEntityId.set(id, parentId);
    if (isPool) this.poolIds.add(id);
    if (parentId !== null) {
      const set = this.childrenByPoolId.get(parentId) ?? new Set<string>();
      set.add(id);
      this.childrenByPoolId.set(parentId, set);
    }
  }

  /**
   * Removes an entity along with every dependency edge that touches it.
   * Containment indices are also cleaned up; callers must remove children
   * before forgetting a pool or the children become orphans here.
   */
  public forgetEntity(id: string): void {
    const parentId = this.parentByEntityId.get(id) ?? null;
    if (parentId !== null) {
      const siblings = this.childrenByPoolId.get(parentId);
      if (siblings !== undefined) {
        siblings.delete(id);
        if (siblings.size === 0) this.childrenByPoolId.delete(parentId);
      }
    }
    this.parentByEntityId.delete(id);
    this.poolIds.delete(id);
    const outgoing = this.outgoingByFromId.get(id);
    if (outgoing !== undefined) for (const toId of [...outgoing]) this.removeEdge(id, toId);
    const incoming = this.incomingByToId.get(id);
    if (incoming !== undefined) for (const fromId of [...incoming]) this.removeEdge(fromId, id);
  }

  /**
   * Returns the parent pool id for an entity, or null when it lives at root.
   * Returns null when the id has not been registered.
   */
  public parentOf(id: string): ParentId {
    return this.parentByEntityId.get(id) ?? null;
  }

  /**
   * Returns the number of direct children indexed under a pool.
   * Used by callers that need to assert a pool is empty before deletion.
   */
  public childCountOf(poolId: string): number {
    return this.childrenByPoolId.get(poolId)?.size ?? 0;
  }

  /**
   * Iterates the direct children of a pool in insertion order.
   * Yields nothing when the pool has no children or is unknown.
   */
  public *childrenOf(poolId: string): Generator<string> {
    const children = this.childrenByPoolId.get(poolId);
    if (children === undefined) return;
    for (const childId of children) yield childId;
  }

  /**
   * Reports whether an edge exists between two entities.
   * Cheap O(1) lookup against the outgoing index.
   */
  public hasEdge(fromId: string, toId: string): boolean {
    return this.outgoingByFromId.get(fromId)?.has(toId) === true;
  }

  /**
   * Records a dependency edge in both indices.
   * Idempotent; callers must check hasEdge first if duplicate-add detection matters.
   */
  public addEdge(fromId: string, toId: string): void {
    const outgoing = this.outgoingByFromId.get(fromId) ?? new Set<string>();
    outgoing.add(toId);
    this.outgoingByFromId.set(fromId, outgoing);
    const incoming = this.incomingByToId.get(toId) ?? new Set<string>();
    incoming.add(fromId);
    this.incomingByToId.set(toId, incoming);
  }

  /**
   * Removes a dependency edge from both indices.
   * No-op when the edge does not exist; safe to call repeatedly.
   */
  public removeEdge(fromId: string, toId: string): void {
    const outgoing = this.outgoingByFromId.get(fromId);
    if (outgoing !== undefined) {
      outgoing.delete(toId);
      if (outgoing.size === 0) this.outgoingByFromId.delete(fromId);
    }
    const incoming = this.incomingByToId.get(toId);
    if (incoming !== undefined) {
      incoming.delete(fromId);
      if (incoming.size === 0) this.incomingByToId.delete(toId);
    }
  }

  /**
   * Yields the explicit dependency targets registered against an entity.
   * Does not include inherited targets from ancestor pools; callers walk up
   * the parent chain themselves when they need the inherited set.
   */
  public *outgoingOf(id: string): Generator<string> {
    const targets = this.outgoingByFromId.get(id);
    if (targets === undefined) return;
    for (const toId of targets) yield toId;
  }

  /**
   * Lists every dependency edge in the graph in insertion order.
   * Snapshots both indices into a stable array suitable for serialization.
   */
  public listEdges(): DependencyRecord[] {
    const edges: DependencyRecord[] = [];
    for (const [fromId, targets] of this.outgoingByFromId) {
      for (const toId of targets) edges.push({ fromId, toId });
    }
    return edges;
  }

  /**
   * Reports whether adding a new edge would close a cycle in the blocker graph.
   * Equivalent to asking whether `toId` already reaches `fromId` through edges
   * we walk: explicit deps, inherited ancestor pool deps, and pool containment.
   */
  public wouldCreateCycle(fromId: string, toId: string): boolean {
    return this.canReachInBlockerGraph(toId, fromId);
  }

  /**
   * Walks the blocker graph from `start` and reports whether `target` is reachable.
   * Edges considered: explicit deps of every node, deps of all ancestor pools of
   * every node, and pool-to-direct-child containment for pools.
   */
  public canReachInBlockerGraph(start: string, target: string): boolean {
    if (start === target) return true;
    const visited = new Set<string>();
    const stack: string[] = [start];
    while (stack.length > 0) {
      const current = stack.pop() as string;
      if (visited.has(current)) continue;
      visited.add(current);
      for (const next of this.collectBlockers(current)) {
        if (next === target) return true;
        if (!visited.has(next)) stack.push(next);
      }
    }
    return false;
  }

  /**
   * Yields the immediate blockers of `id` for the blocker graph.
   * Order: explicit deps from id, then inherited deps walking up ancestors,
   * then direct children when id is a pool.
   */
  public *collectBlockers(id: string): Generator<string> {
    let cursor: ParentId = id;
    while (cursor !== null) {
      const explicit = this.outgoingByFromId.get(cursor);
      if (explicit !== undefined) for (const target of explicit) yield target;
      cursor = this.parentByEntityId.get(cursor) ?? null;
    }
    if (this.poolIds.has(id)) {
      const children = this.childrenByPoolId.get(id);
      if (children !== undefined) for (const childId of children) yield childId;
    }
  }
}
