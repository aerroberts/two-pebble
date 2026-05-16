import { describe, expect, test } from 'bun:test';
import type { TipTapDocument } from './document-content';
import { applyTodoStatus, extractTodos } from './document-todos';
import { sampleDoc } from './document-todos-test-support';

describe('feature: document todo extraction', () => {
  test('happy: flattens every todoItem including nested ones', () => {
    const todos = extractTodos(sampleDoc());
    expect(todos.map((t) => ({ id: t.id, status: t.status, text: t.text }))).toEqual([
      { id: '01J-A', status: 'open', text: 'first task' },
      { id: '01J-B', status: 'completed', text: 'done thing' },
      { id: '01J-C', status: 'invalid', text: 'nested todo' },
    ]);
    expect(todos[1]?.completionType).toBe('manual');
  });

  test('happy: skips todos that are missing an id', () => {
    const doc: TipTapDocument = {
      type: 'doc',
      content: [{ type: 'todoItem', attrs: { status: 'open' }, content: [{ type: 'text', text: 'noid' }] }],
    };
    expect(extractTodos(doc)).toEqual([]);
  });

  test('happy: applyTodoStatus updates only the matching todo', () => {
    const doc = sampleDoc();
    const next = applyTodoStatus(doc, '01J-A', 'completed', 'manual');
    const aliceTodos = extractTodos(next);
    expect(aliceTodos.find((t) => t.id === '01J-A')?.status).toBe('completed');
    expect(aliceTodos.find((t) => t.id === '01J-B')?.status).toBe('completed');
    expect(aliceTodos.find((t) => t.id === '01J-C')?.status).toBe('invalid');
  });

  test('happy: applyTodoStatus is a no-op for unknown ids', () => {
    const doc = sampleDoc();
    const next = applyTodoStatus(doc, '01J-MISSING', 'completed');
    expect(next).toBe(doc);
  });

  test('happy: applyTodoStatus clears completionType when set to undefined', () => {
    const doc = sampleDoc();
    const next = applyTodoStatus(doc, '01J-B', 'open');
    const bTodo = extractTodos(next).find((t) => t.id === '01J-B');
    expect(bTodo?.status).toBe('open');
    expect(bTodo?.completionType).toBeUndefined();
  });
});
