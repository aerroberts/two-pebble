import { describe, expect, it } from 'bun:test';
import { CycleError } from './errors/cycle-error';
import { DuplicateIdError } from './errors/duplicate-id-error';
import { InvalidStatusTransitionError } from './errors/invalid-status-transition-error';
import { NonEmptyPoolError } from './errors/non-empty-pool-error';
import { NotFoundError } from './errors/not-found-error';
import { SelfDependencyError } from './errors/self-dependency-error';
import { SiblingViolationError } from './errors/sibling-violation-error';
import { TaskBoard } from './task-board';

describe('feature: task creation and queries', () => {
  it('happy: a new task with no deps is open', () => {
    const board = new TaskBoard('b');
    board.addTask({ id: 't' });
    expect(board.getTaskStatus('t')).toBe('open');
    expect(board.getAvailableTasks().map((t) => t.id)).toEqual(['t']);
  });

  it('happy: a task created with deps is blocked until they resolve', () => {
    const board = new TaskBoard('b');
    board.addTask({ id: 't1' });
    board.addTask({ id: 't2', dependsOn: ['t1'] });
    expect(board.getTaskStatus('t2')).toBe('blocked');
    expect(board.getAvailableTasks().map((t) => t.id)).toEqual(['t1']);
  });

  it('happy: settling a dep to success unblocks dependents', () => {
    const board = new TaskBoard('b');
    board.addTask({ id: 't1' });
    board.addTask({ id: 't2', dependsOn: ['t1'] });
    board.setTaskStatus('t1', 'success');
    expect(board.getTaskStatus('t2')).toBe('open');
  });

  it('happy: a task can be set to working then success', () => {
    const board = new TaskBoard('b');
    board.addTask({ id: 't' });
    board.setTaskStatus('t', 'working');
    expect(board.getTaskStatus('t')).toBe('working');
    board.setTaskStatus('t', 'success');
    expect(board.getTaskStatus('t')).toBe('success');
  });

  it('unhappy: duplicate ids are rejected', () => {
    const board = new TaskBoard('b');
    board.addTask({ id: 't' });
    expect(() => board.addTask({ id: 't' })).toThrow(DuplicateIdError);
    expect(() => board.addPool({ id: 't' })).toThrow(DuplicateIdError);
  });
});

describe('feature: pool creation and resolution', () => {
  it('happy: a pool resolves only when every descendant terminates', () => {
    const board = new TaskBoard('b');
    board.addPool({ id: 'p' });
    board.addTask({ id: 't1', poolId: 'p' });
    board.addTask({ id: 't2', poolId: 'p' });
    board.addTask({ id: 'consumer', dependsOn: ['p'] });
    expect(board.getTaskStatus('consumer')).toBe('blocked');
    board.setTaskStatus('t1', 'success');
    expect(board.getTaskStatus('consumer')).toBe('blocked');
    board.setTaskStatus('t2', 'failure');
    expect(board.getTaskStatus('consumer')).toBe('open');
  });

  it('happy: nested pools propagate resolution upward', () => {
    const board = new TaskBoard('b');
    board.addPool({ id: 'outer' });
    board.addPool({ id: 'inner', parentPoolId: 'outer' });
    board.addTask({ id: 'leaf', poolId: 'inner' });
    board.addTask({ id: 'consumer', dependsOn: ['outer'] });
    expect(board.getTaskStatus('consumer')).toBe('blocked');
    board.setTaskStatus('leaf', 'success');
    expect(board.getTaskStatus('consumer')).toBe('open');
  });

  it('happy: pool deps inherit down to descendants', () => {
    const board = new TaskBoard('b');
    board.addPool({ id: 'gate' });
    board.addPool({ id: 'group', dependsOn: ['gate'] });
    board.addTask({ id: 'gateTask', poolId: 'gate' });
    board.addTask({ id: 'memberTask', poolId: 'group' });
    expect(board.getTaskStatus('memberTask')).toBe('blocked');
    board.setTaskStatus('gateTask', 'success');
    expect(board.getTaskStatus('memberTask')).toBe('open');
  });

  it('unhappy: removePool throws when the pool still has members', () => {
    const board = new TaskBoard('b');
    board.addPool({ id: 'p' });
    board.addTask({ id: 't', poolId: 'p' });
    expect(() => board.removePool('p')).toThrow(NonEmptyPoolError);
  });
});

describe('feature: dependency validation', () => {
  it('unhappy: a task cannot depend on itself', () => {
    const board = new TaskBoard('b');
    board.addTask({ id: 't' });
    expect(() => board.addDependency({ fromId: 't', toId: 't' })).toThrow(SelfDependencyError);
  });

  it('unhappy: depending on an unknown id throws NotFoundError', () => {
    const board = new TaskBoard('b');
    board.addTask({ id: 't' });
    expect(() => board.addDependency({ fromId: 't', toId: 'missing' })).toThrow(NotFoundError);
  });

  it('unhappy: a task cannot depend on its containing pool', () => {
    const board = new TaskBoard('b');
    board.addPool({ id: 'p' });
    board.addTask({ id: 't', poolId: 'p' });
    expect(() => board.addDependency({ fromId: 't', toId: 'p' })).toThrow(SiblingViolationError);
  });

  it('unhappy: a pool cannot depend on its own child', () => {
    const board = new TaskBoard('b');
    board.addPool({ id: 'p' });
    board.addTask({ id: 't', poolId: 'p' });
    expect(() => board.addDependency({ fromId: 'p', toId: 't' })).toThrow(SiblingViolationError);
  });

  it('unhappy: tasks in different pools cannot depend across', () => {
    const board = new TaskBoard('b');
    board.addPool({ id: 'a' });
    board.addPool({ id: 'b' });
    board.addTask({ id: 'ta', poolId: 'a' });
    board.addTask({ id: 'tb', poolId: 'b' });
    expect(() => board.addDependency({ fromId: 'ta', toId: 'tb' })).toThrow(SiblingViolationError);
  });

  it('happy: siblings inside the same pool may depend on each other', () => {
    const board = new TaskBoard('b');
    board.addPool({ id: 'p' });
    board.addTask({ id: 't1', poolId: 'p' });
    board.addTask({ id: 't2', poolId: 'p' });
    board.addDependency({ fromId: 't2', toId: 't1' });
    expect(board.getTaskStatus('t2')).toBe('blocked');
  });
});

describe('feature: cycle detection', () => {
  it('unhappy: a direct two-task cycle is rejected', () => {
    const board = new TaskBoard('b');
    board.addTask({ id: 'a' });
    board.addTask({ id: 'b', dependsOn: ['a'] });
    expect(() => board.addDependency({ fromId: 'a', toId: 'b' })).toThrow(CycleError);
  });

  it('unhappy: a transitive cycle through siblings is rejected', () => {
    const board = new TaskBoard('b');
    board.addTask({ id: 'a' });
    board.addTask({ id: 'b', dependsOn: ['a'] });
    board.addTask({ id: 'c', dependsOn: ['b'] });
    expect(() => board.addDependency({ fromId: 'a', toId: 'c' })).toThrow(CycleError);
  });

  it('unhappy: dependency on a pool that contains a transitive blocker is rejected', () => {
    const board = new TaskBoard('b');
    board.addPool({ id: 'p' });
    board.addPool({ id: 'q' });
    board.addTask({ id: 't', poolId: 'p' });
    board.addDependency({ fromId: 'p', toId: 'q' });
    expect(() => board.addDependency({ fromId: 'q', toId: 'p' })).toThrow(CycleError);
  });
});

describe('feature: status transitions', () => {
  it('unhappy: cannot start a blocked task', () => {
    const board = new TaskBoard('b');
    board.addTask({ id: 'a' });
    board.addTask({ id: 'b', dependsOn: ['a'] });
    expect(() => board.setTaskStatus('b', 'working')).toThrow(InvalidStatusTransitionError);
  });

  it('unhappy: cannot leave a terminal state', () => {
    const board = new TaskBoard('b');
    board.addTask({ id: 't' });
    board.setTaskStatus('t', 'success');
    expect(() => board.setTaskStatus('t', 'working')).toThrow(InvalidStatusTransitionError);
  });

  it('happy: working can transition to waiting and back', () => {
    const board = new TaskBoard('b');
    board.addTask({ id: 't' });
    board.setTaskStatus('t', 'working');
    board.setTaskStatus('t', 'waiting');
    expect(board.getTaskStatus('t')).toBe('waiting');
    board.setTaskStatus('t', 'working');
    expect(board.getTaskStatus('t')).toBe('working');
  });
});

describe('feature: subscribe events', () => {
  it('happy: subscribers see open->blocked when a dep is added', () => {
    const board = new TaskBoard('b');
    board.addTask({ id: 'a' });
    board.addTask({ id: 'b' });
    const events: string[] = [];
    board.subscribe((event) => events.push(`${event.taskId}:${event.previous}->${event.next}`));
    board.addDependency({ fromId: 'b', toId: 'a' });
    expect(events).toEqual(['b:open->blocked']);
  });

  it('happy: cascading unblock fires events for newly-open dependents', () => {
    const board = new TaskBoard('b');
    board.addTask({ id: 'a' });
    board.addTask({ id: 'b', dependsOn: ['a'] });
    const events: string[] = [];
    board.subscribe((event) => events.push(`${event.taskId}:${event.previous}->${event.next}`));
    board.setTaskStatus('a', 'success');
    expect(events).toEqual(['a:open->success', 'b:blocked->open']);
  });

  it('happy: unsubscribe stops further events', () => {
    const board = new TaskBoard('b');
    board.addTask({ id: 't' });
    const events: string[] = [];
    const unsubscribe = board.subscribe((event) => events.push(event.taskId));
    unsubscribe();
    board.setTaskStatus('t', 'working');
    expect(events).toEqual([]);
  });
});

describe('feature: removals', () => {
  it('happy: removeTask drops outgoing and incoming edges', () => {
    const board = new TaskBoard('b');
    board.addTask({ id: 'a' });
    board.addTask({ id: 'b', dependsOn: ['a'] });
    board.removeTask('a');
    expect(board.getTaskStatus('b')).toBe('open');
    expect(board.listDependencies()).toEqual([]);
  });

  it('happy: removeDependency unblocks the dependent', () => {
    const board = new TaskBoard('b');
    board.addTask({ id: 'a' });
    board.addTask({ id: 'b', dependsOn: ['a'] });
    board.removeDependency('b', 'a');
    expect(board.getTaskStatus('b')).toBe('open');
  });

  it('happy: empty pool can be removed', () => {
    const board = new TaskBoard('b');
    board.addPool({ id: 'p' });
    board.removePool('p');
    expect(() => board.getPool('p')).toThrow(NotFoundError);
  });
});
