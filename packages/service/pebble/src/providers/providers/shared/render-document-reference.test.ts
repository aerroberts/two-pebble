import { describe, expect, test } from 'bun:test';
import type { DocumentTodo } from '@two-pebble/datatypes';
import { renderDocumentReferenceText } from './render-document-reference';

describe('feature: document reference rendering', () => {
  const baseContent = {
    documentId: 'doc-1',
    name: 'Plan',
    contentSnapshot: 'body',
    documentUpdatedAt: 0,
  };

  const mixedTodos: DocumentTodo[] = [
    { id: '01A', status: 'open', text: 'Wire daemon resolver' },
    { id: '01B', status: 'completed', text: 'done' },
    { id: '01C', status: 'open', text: 'Add capability' },
    { id: '01D', status: 'invalid', text: 'cancelled' },
  ];

  const terminalTodos: DocumentTodo[] = [
    { id: '01A', status: 'completed', text: 'done' },
    { id: '01B', status: 'invalid', text: 'cancelled' },
  ];

  test('happy: omits open-tasks block when no todos are present', () => {
    const out = renderDocumentReferenceText(baseContent);
    expect(out).toBe('[document: Plan (id: doc-1)]\n\nbody');
  });

  test('happy: emits open-tasks block listing only open todos', () => {
    const out = renderDocumentReferenceText({ ...baseContent, todos: mixedTodos });
    expect(out).toContain('id=01A status=open "Wire daemon resolver"');
    expect(out).toContain('id=01C status=open "Add capability"');
    expect(out).not.toContain('01B');
    expect(out).not.toContain('01D');
  });

  test('happy: omits open-tasks block when no todos are open', () => {
    const out = renderDocumentReferenceText({ ...baseContent, todos: terminalTodos });
    expect(out).not.toContain('<open-tasks>');
  });
});
