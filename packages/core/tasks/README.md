# @two-pebble/tasks

`TaskBoard` is an in-memory dependency graph of tasks grouped into pools. It
enforces the rules — no cycles, no duplicate ids, no self-dependencies, valid
status transitions — and tells you which tasks are currently available to run
(their dependencies are satisfied). Subscribe to be notified of any change.

Use this package to model and schedule dependent work for an agent run.

## Usage

```ts
import { TaskBoard } from '@two-pebble/tasks';

const board = new TaskBoard('release');

board.addPool({ id: 'build' });
board.addTask({ id: 'compile', poolId: 'build' });
board.addTask({ id: 'test', poolId: 'build' });

// `test` can only run after `compile` succeeds.
board.addDependency({ fromId: 'test', toId: 'compile' });

// React to changes (e.g. re-render or schedule the next task).
const unsubscribe = board.subscribe(() => {
  console.log('available:', board.getAvailableTasks().map((t) => t.id));
});

board.setTaskStatus('compile', 'done'); // now `test` becomes available
unsubscribe();
```

Invalid operations throw typed errors (`CycleError`, `DuplicateIdError`,
`InvalidStatusTransitionError`, and friends) so callers can react precisely.

## Errors

Invalid operations throw typed errors so callers can react precisely rather than
parsing messages: `CycleError`, `DuplicateIdError`, `InvalidStatusTransitionError`,
`NonEmptyPoolError`, `NotFoundError`, `SelfDependencyError`, `SiblingViolationError`,
and `TaskOwnershipError`.
