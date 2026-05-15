# Plan: Assign an Agent as Runner to a Board / Pool (with Settings)

## Context

In this repo today:

- **Boards** (`task_boards`) and **Pools** (`task_pools`) already exist as the
  task hierarchy. Pools nest under boards via `parentPoolId`.
  See `packages/data/datastore/src/schema/task-boards.table.ts` and
  `task-pools.table.ts`.
- **Agents** are runtime instances (`agents` table) launched from
  **Agent Registries** (templates in `agent_registries`). A registry carries
  the system prompt, workspace config, and a JSON `capabilities` array.
- The word *"runner"* already appears in the code, but it refers to
  **internal capability runners** (e.g. `task-board-runner`,
  `signal-runner`) — internal plumbing that wires an agent up to daemon
  services. **It does not mean an agent assigned to drive a board.**
  This plan introduces a new meaning of "runner" at the product layer.
- The closest existing primitive is `TaskBoardAccessCapability`
  (`packages/service/pebble/src/capabilities/task-board-access/…`), which
  takes a `{ boardId }` config at registry creation. That direction goes
  *agent → board* (an agent template knows which board it can touch). The
  feature here is the **inverse**: a board or pool says *"this agent
  registry is my runner, with these settings"* — and is read by anyone
  asking "who runs this pool?".

> **Scope statement.** This is greenfield: no existing assignment / pool /
> runner-binding table, daemon service, protocol op, or UI element exists.
> We are adding a new vertical slice, not extending one.

## Requirements

### Functional

1. A user can assign **exactly one runner** to a board.
2. A user can assign a runner to any pool inside a board. Pool runner
   **overrides** the board runner for tasks inside that pool.
3. The runner is identified by an **AgentRegistryId** (template), not by a
   live `AgentId`. The system launches a fresh agent from the template
   when work needs to be done; the assignment outlives any one agent.
4. Each assignment carries **settings** (typed JSON), including at minimum:
   - `autoClaim: boolean` — when true, the daemon launches the runner on
     newly unblocked tasks automatically.
   - `maxConcurrentTasks: number` (default `1`) — how many tasks the
     runner may take in parallel.
   - `claimDelayMs: number` (default `0`) — debounce before claiming a
     newly-open task, so a human can pre-empt.
   - `instructions: string` (default `""`) — extra system-prompt
     fragment appended at launch.
5. Assignments are **soft**: deleting the assignment does not affect any
   already-running agent; it only stops *future* claims.
6. Resolving "who runs task T?" walks pool ancestors: nearest pool with a
   runner wins; otherwise board-level runner; otherwise unassigned.
7. UI surfaces the assignment on the board settings view and inline on
   pools in the task-board page. Settings are editable in place.
8. When a runner-launched agent **exits** (status transitions from
   `running` to any non-running state — `idle`, `failed`, `interrupted`,
   `offline`), the runner service decrements the in-flight counter for
   the relevant assignment and re-evaluates pending open tasks. See
   *Flow §3 — Agent exit detection* for the exact hook.

### Non-functional

- Existing `TaskBoardAccessCapability` behavior must not change.
- Replay-safe: the daemon must be able to rebuild any in-memory runner
  state on boot from the datastore (same pattern as task boards).
- Operations follow the existing thin-operation / fat-handler split.

## Data Model

New table: `runner_assignments` in
`packages/data/datastore/src/schema/runner-assignments.table.ts`.

```ts
export const runnerAssignmentsTable = customTable('runner_assignments', {
  // Exactly one of (boardId, poolId) is set. We model it as both columns
  // nullable plus a uniqueness invariant enforced at service-layer:
  // - boardId set, poolId null → board-level runner
  // - boardId set, poolId set  → pool-level runner (pool must belong to board)
  boardId: text('board_id').notNull(),
  poolId: text('pool_id'), // null → applies to the whole board

  // Template the daemon will launch agents from when it needs to claim work.
  agentRegistryId: text('agent_registry_id').notNull(),

  // Typed settings JSON, see RunnerAssignmentSettings below.
  settings: text('settings').notNull().default('{}'),
});
```

Uniqueness invariants (enforced in service layer, not SQL, to match
existing tables which carry no SQL-level uniqueness):

- At most one row per `(boardId, poolId IS NULL)`.
- At most one row per `(boardId, poolId)` for each non-null pool.

Companion type, colocated in `@two-pebble/datastore` exports:

```ts
export interface RunnerAssignmentSettings {
  autoClaim: boolean;
  maxConcurrentTasks: number; // >= 1
  claimDelayMs: number;       // >= 0
  instructions: string;
}

export interface RunnerAssignmentRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  boardId: string;
  poolId: string | null;
  agentRegistryId: string;
  settings: RunnerAssignmentSettings;
}
```

### Resolution algorithm

For a task `T` in pool chain `[Pn, Pn-1, …, P0]` on board `B`:

```
for each pool in [Pn, Pn-1, …, P0]:
  if assignment exists for (B, pool.id) → return it
if assignment exists for (B, null) → return it
return null  # unassigned
```

This runs in the daemon (`RunnerAssignmentService.resolveForTask`) and is
cached per-board in memory, invalidated on any assignment mutation.

## Flow

### 1. Assign / update runner (user action)

1. User picks an agent registry from a board-settings or pool-row picker
   in the UI.
2. UI calls **`runner-assignments.upsert`** operation (new protocol op)
   with `{ boardId, poolId, agentRegistryId, settings }`.
3. Realtime operation in `packages/data/realtime/src/operations/
   runner-assignment.upsert.operation.ts` emits to datastore.
4. Daemon handler in `packages/service/daemon/src/handlers/
   runner-assignment.upsert.handler.ts` validates:
   - `boardId` exists
   - if `poolId !== null`, pool belongs to board
   - `agentRegistryId` exists
   - `settings` parses against `RunnerAssignmentSettings` schema
5. Handler calls `RunnerAssignmentService.upsert(input)` which writes the
   row and invalidates the per-board cache.

### 2. Auto-claim on newly-open task (system action)

1. `TaskBoardService` already emits status events when a task becomes
   `open` (newly unblocked).
2. A new listener `RunnerAssignmentService.onTaskOpened` subscribes to
   these events.
3. On `open`, it calls `resolveForTask(task)`:
   - If no assignment → no-op.
   - If `settings.autoClaim === false` → no-op.
   - If currently running children of the runner (filtered by board /
     pool) ≥ `maxConcurrentTasks` → enqueue in an in-memory
     `pendingByAssignmentId: Map<assignmentId, taskId[]>`. The queue is
     drained by the agent-exit path below, not by retries.
   - Else: reserve a slot (increment in-flight counter), wait
     `claimDelayMs`, then call
     `AgentRegistryService.launch({ agentRegistryId, message: "<task
     delegation>", launchContext: { taskId, boardId, poolId,
     instructions } })`. Store the returned `agentId` in
     `inFlightByAssignmentId: Map<assignmentId, Set<agentId>>` and in
     a reverse index `assignmentByAgentId: Map<agentId, assignmentId>`.
4. Launched agent records its `parentAgentId` as `null` (top-level launch)
   and its `agentRegistryId` as the runner's registry. The
   `RecordDelegationInput` plumbing (already in
   `task-board-service-types.ts`) records the delegation event so the
   task carries an explicit `agentId` owner — see *§5 Agent ownership*.

### 3. Agent exit detection — pulling the next task

This is the critical loop step that the previous draft left implicit.

**Event source.** `persistAgentStatus` in
`packages/service/daemon/src/services/agent-registry-status.ts` is the
single chokepoint through which every agent status transition flows.
It exposes a real seam:

```ts
onStatusPersisted?: (agentId: string, status: AgentStatus) => void
```

…wired through `AgentRegistryListenerContext`
(`agent-registry-listener-context.ts:17`) and currently a no-op in
`AgentRegistryService` (`agent-registry-service.ts:302`). In addition,
the daemon `bridge` emits `agentRecorded` on every status write, which
the realtime layer already consumes.

**Hook.** `RunnerAssignmentService` registers itself as a second
listener on `onStatusPersisted`. We chain rather than replace — the
existing failure-path `taskBoards.syncOwnedTasksFromAgentStatus` call
must still run. Concretely, `AgentRegistryService` is changed so its
`onStatusPersisted` fans out to *both* the (current) no-op and to
`runnerAssignments.onAgentStatusChanged(agentId, status)`.

**Handler logic.** `onAgentStatusChanged(agentId, status)`:

1. Look up `assignmentByAgentId.get(agentId)`. If absent, the agent was
   not launched by the runner service — return.
2. If `status === 'running'`, ignore (we already incremented at launch).
3. Otherwise the agent has exited (any of `idle`, `failed`,
   `interrupted`, `offline`):
   a. Remove `agentId` from `inFlightByAssignmentId[assignmentId]` and
      from `assignmentByAgentId`. The in-flight counter drops by one.
   b. Drain `pendingByAssignmentId[assignmentId]` while the in-flight
      count is below `settings.maxConcurrentTasks`: pop the next
      `taskId`, re-check it is still `open` (it may have been claimed
      manually or re-blocked since enqueue — call
      `TaskBoardService.describeBoard` or a lighter `getTask` helper),
      then run the same reserve + launch path as §2 step 3.
   c. If `status === 'failed'` *and* the task was delegated to this
      agent, the existing `syncOwnedTasksFromAgentStatus` already moves
      the owned task back to a non-terminal state (see
      `agent-registry-status.ts:67`); the runner service does **not**
      duplicate that — it just frees the slot and pulls the next.

**State updates.** All counters live in the service in memory; they
are rebuilt on daemon boot by:

1. Loading every `runner_assignments` row.
2. Querying agents whose `agentRegistryId` matches an assignment and
   whose `status === 'running'`, then attributing each to its
   assignment (by `(boardId, poolId)` via the delegation event log).

No new persisted state is required for the in-flight tracking — the
agents table is already the source of truth for who is running.

### 4. Read runner (daemon, UI, capability)

- UI lists assignments per board via `runner-assignments.list-by-board`.
- Existing `TaskBoardAccessCapability` is unchanged. Optionally
  (out-of-scope for v1) it could consult `resolveForTask` to surface "who
  owns this" in the agent's context — flagged as a follow-up.

### 5. Agent ownership of tasks (delegation tracking)

The runner system intentionally **does not** add a new "owner" column
to `tasks`. Ownership is already represented in the existing delegation
event stream (`RecordDelegationInput` in
`packages/service/daemon/src/services/task-board-service-types.ts`).
The runner service simply becomes a *new caller* of that pathway:

- On launch (§2 step 3), the runner service calls
  `taskBoardService.recordDelegation({ taskId, agentId, agentRegistryId,
  agentName, reason: 'runner-claim' })` immediately after the agent
  starts. This is the same call any human-driven delegation makes, so
  "who's working on this task right now?" queries already work
  unchanged.
- On agent exit (§3), if the delegated task is still un-terminated, the
  service emits the matching `RecordUndelegationInput` so UI badges
  clear. For `status === 'failed'`, this is already handled by
  `syncOwnedTasksFromAgentStatus`; the runner service only emits
  undelegate for the `idle` / `interrupted` / `offline` cases that the
  status-sync path does not cover.
- Per-task → runner mapping is therefore *derived* (latest delegation
  event for the task) rather than persisted on the assignment row. This
  keeps the assignment table small and avoids dual-source-of-truth
  bugs between assignment rows and per-task ownership.

### 6. Unassign

- `runner-assignments.delete` op with `{ id }`. Service deletes the row
  and invalidates the cache. Already-running children are not killed.
  The exit hook in §3 still fires for those children — once the
  assignment is gone, `assignmentByAgentId` lookup returns `undefined`
  and no follow-up claim happens, so the queue drains cleanly.

## Files to Add / Modify

### New files

- `packages/data/datastore/src/schema/runner-assignments.table.ts`
- `packages/data/datastore/src/types/runner-assignment.ts`
  (the `RunnerAssignmentRecord` / `RunnerAssignmentSettings` types and
  the JSON parser, modeled on `parseWorkspaceConfig`)
- `packages/data/protocol/src/protocol/runner-assignment.upsert.ts`
- `packages/data/protocol/src/protocol/runner-assignment.delete.ts`
- `packages/data/protocol/src/protocol/runner-assignment.list-by-board.ts`
- `packages/data/realtime/src/operations/runner-assignment.upsert.operation.ts`
- `packages/data/realtime/src/operations/runner-assignment.delete.operation.ts`
- `packages/data/realtime/src/operations/runner-assignment.list-by-board.operation.ts`
- `packages/data/realtime/src/states/runner-assignments/types.ts` (state
  slice for cache subscriptions, mirroring `states/agents/`)
- `packages/service/daemon/src/services/runner-assignment-service.ts`
- `packages/service/daemon/src/services/runner-assignment-service-types.ts`
- `packages/service/daemon/src/handlers/runner-assignment.upsert.handler.ts`
- `packages/service/daemon/src/handlers/runner-assignment.delete.handler.ts`
- `packages/service/daemon/src/handlers/runner-assignment.list-by-board.handler.ts`
- `packages/ui/app/src/pages/task-board/runner-assignment-section.tsx`
  (board-level picker + settings inputs, mounted inside
  `task-board-settings-view.tsx`)
- `packages/ui/app/src/pages/task-board/pool-runner-row.tsx`
  (per-pool inline override; mounted inside the existing pool row in
  `task-board.page.tsx`)
- `packages/ui/app/src/pages/task-board/use-runner-assignments.ts`
  (state hook reading the new realtime slice)

### Modified files

- `packages/data/datastore/src/schema/index.ts` — export new table.
- `packages/data/datastore/src/index.ts` — re-export
  `RunnerAssignmentRecord`, `RunnerAssignmentSettings`.
- `packages/data/protocol/src/index.ts` — re-export new ops.
- `packages/service/daemon/src/services/task-board-service.ts` — emit /
  expose task-`open` events that `RunnerAssignmentService` subscribes to.
  Most of this is already in place via `task-events`; verify and wire.
- `packages/service/daemon/src/daemon.ts` (or wherever services are
  composed) — instantiate `RunnerAssignmentService`, pass it `Datastore`,
  `AgentRegistryService`, `TaskBoardService`, `Logger`. Register the new
  handlers.
- `packages/ui/app/src/pages/task-board/task-board-settings-view.tsx` —
  mount `<RunnerAssignmentSection boardId={…} />`.
- `packages/ui/app/src/pages/task-board/task-board.page.tsx` — render
  `<PoolRunnerRow poolId={…} />` accessory on each pool row.

## Implementation Steps (suggested order)

1. **Schema + types.** Add the table and types. Run the datastore tests
   to confirm the migration generator is happy.
2. **Protocol ops.** Define request/response shapes for upsert, delete,
   list-by-board. Mirror `agent.launch.ts` for structure.
3. **Daemon service.** Implement `RunnerAssignmentService` with `upsert`,
   `delete`, `listByBoard`, `resolveForTask`. Internal cache keyed by
   `boardId`. No auto-claim wiring yet — just CRUD + resolution. Unit
   test the resolution algorithm with a fixture: nested pools,
   board-level fallback, missing assignment.
4. **Realtime operations + state slice.** Wire the ops to the daemon.
   Add a realtime state slice so the UI can subscribe.
5. **UI v1 (read + assign).** Build `RunnerAssignmentSection` with a
   registry picker, settings inputs (toggle, number, number, text), save
   button. Mount it in the board settings view.
6. **UI v2 (per-pool override).** `PoolRunnerRow` reuses the same form,
   bound to `{ boardId, poolId }`.
7. **Auto-claim.** Add `onTaskOpened` listener inside the daemon service.
   Plumb `launch` via `AgentRegistryService`. Honour `maxConcurrentTasks`
   and `claimDelayMs`. Gate with `autoClaim: false` default until the
   path is validated end-to-end. Call `recordDelegation` immediately
   after each successful launch (Flow §5).
8. **Exit hook + queue drain.** Wire `RunnerAssignmentService` into the
   `onStatusPersisted` fan-out in
   `agent-registry-service.ts:302` so the existing no-op becomes a
   tee'd call to both the previous handler and
   `runnerAssignments.onAgentStatusChanged`. Implement the
   in-flight/pending maps described in Flow §3. On exit, emit
   `recordUndelegation` for non-failed exits whose tasks are still
   un-terminated.
9. **Boot reconciliation.** Reconstruct in-memory maps from the
   datastore at startup (Flow §3 *State updates*) so a daemon restart
   does not double-launch or strand pending queues.
10. **End-to-end smoke.** Create a board, attach a registry, set
    `autoClaim: true`, create two tasks with `maxConcurrentTasks: 1`,
    observe one child agent launch, the second task queue, the first
    agent settle to `idle`, and the second launch follow.

## Decisions on Previously-Open Questions

Each item below is committed for this plan. The two flagged
**(confirm before merge)** still need user sign-off but the
implementation should proceed against the chosen default; reversing
either is a localized change, not a redesign.

1. **Runner identity — decided: AgentRegistry (template).**
   The assignment stores `agentRegistryId`, and the service launches a
   fresh agent per claim. Reasoning: a live `AgentId` would couple the
   assignment's lifetime to a single agent instance — if that agent
   exits or is interrupted, the board would silently lose its runner.
   Registries are stable, user-managed templates and match the same
   abstraction `AgentRegistryService.launch` already operates on.
   *(Confirm before merge.)*

2. **Settings inheritance for pool overrides — decided: full replace.**
   A pool-level assignment row carries its own complete settings
   object; nothing is merged from the board-level row. Reasoning:
   merging four small fields adds an order-of-precedence question to
   every settings read and to every UI field ("inherited? overridden?
   default?"), and the value at stake is low. A future *Reset to board
   defaults* button in the UI can copy values across without making
   inheritance a runtime concept.

3. **`maxConcurrentTasks` scope — decided: per assignment.**
   Each `(boardId, poolId)` row tracks its own in-flight count. A
   registry assigned to two different pools gets two independent
   capacity budgets. Reasoning: per-registry global limits would force
   the service to coordinate across boards owned by different users /
   contexts, which is out of scope; per-assignment is the smallest
   semantically-clean unit and matches how the service already keys its
   in-memory maps (see Flow §3).
   *(Confirm before merge — flag if you want a global cap layer
   later.)*

4. **"Run now" UI affordance — decided: not in v1.**
   Out of scope. Manual launches keep going through the existing
   `agent.launch` op. Revisit only after auto-claim is validated
   end-to-end.

5. **Assignment row uniqueness enforcement — decided: service layer,
   not SQL.** Matches the existing repo convention (no SQL-level unique
   indexes on `task_pools`, `task_boards`, etc.). The service rejects
   conflicting upserts with a typed error before writing.

## Test Plan

- Unit: `RunnerAssignmentService.resolveForTask` over a fixture board
  with nested pools, asserting nearest-ancestor wins, board fallback,
  null when unassigned.
- Unit: settings parse rejects negative numbers, non-integer
  `maxConcurrentTasks`, missing fields.
- Integration (daemon): upsert → list-by-board returns the row;
  delete → list returns empty.
- Integration (auto-claim): with `autoClaim: true`, opening a task
  causes one launch; with `maxConcurrentTasks: 1` and one in-flight
  child, a second open task does not launch a second child until the
  first settles.
- Integration (exit hook): drive the agent to `idle` and assert the
  queued task is launched; drive a different agent to `failed` and
  assert the existing `syncOwnedTasksFromAgentStatus` ran exactly once
  (no double-handling from the new listener).
- Integration (delegation tracking): after auto-launch, the task event
  log contains a delegation row pointing at the launched agent; after
  the agent settles to `idle` without completing the task, an
  undelegation row appears.
- Integration (boot reconciliation): persist an assignment, launch an
  agent through it, kill the daemon mid-run with the agent still
  `running`, restart, and assert the in-flight counter is rebuilt
  (verified by observing that a freshly-opened task does not exceed
  `maxConcurrentTasks`).
- UI: cypress / existing UI harness, if available, to drive the
  settings form and confirm round-trip.
