import { describe, expect, it } from 'bun:test';
import { diffTaskList } from './task-list-diff';

describe('feature: shared task-list diff', () => {
  it('happy: first snapshot reports every task as net-new', () => {
    const result = diffTaskList(
      [],
      [
        { description: 'Write tests', status: 'open' },
        { description: 'Ship it', status: 'pending' },
      ],
    );
    expect(result.tasks).toEqual([
      { id: 'write-tests', description: 'Write tests', status: 'open' },
      { id: 'ship-it', description: 'Ship it', status: 'pending' },
    ]);
    expect(result.changes).toEqual([
      { id: 'write-tests', oldStatus: null, newStatus: 'open' },
      { id: 'ship-it', oldStatus: null, newStatus: 'pending' },
    ]);
  });

  it('happy: only emits changes for tasks whose status actually moved', () => {
    const previous = diffTaskList(
      [],
      [
        { description: 'Write tests', status: 'open' },
        { description: 'Ship it', status: 'pending' },
      ],
    ).tasks;
    const next = diffTaskList(previous, [
      { description: 'Write tests', status: 'completed' },
      { description: 'Ship it', status: 'pending' },
    ]);
    expect(next.changes).toEqual([{ id: 'write-tests', oldStatus: 'open', newStatus: 'completed' }]);
  });

  it('happy: stable ids survive reordering', () => {
    const previous = diffTaskList(
      [],
      [
        { description: 'First', status: 'open' },
        { description: 'Second', status: 'pending' },
      ],
    ).tasks;
    const next = diffTaskList(previous, [
      { description: 'Second', status: 'completed' },
      { description: 'First', status: 'open' },
    ]);
    expect(next.tasks.map((task) => task.id)).toEqual(['second', 'first']);
    expect(next.changes).toEqual([{ id: 'second', oldStatus: 'pending', newStatus: 'completed' }]);
  });

  it('edge: duplicate descriptions get positional suffixes', () => {
    const result = diffTaskList(
      [],
      [
        { description: 'Repeat', status: 'open' },
        { description: 'Repeat', status: 'pending' },
      ],
    );
    expect(result.tasks.map((task) => task.id)).toEqual(['repeat', 'repeat-2']);
  });

  it('edge: empty descriptions fall back to `todo`', () => {
    const result = diffTaskList([], [{ description: '   ', status: 'open' }]);
    expect(result.tasks[0]?.id).toBe('todo');
  });
});
