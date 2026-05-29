import { describe, expect, test } from 'bun:test';
import { tipTapDocToCells } from './tiptap-doc-to-cells';
import {
  BOARD_MENTION_DOC,
  CODE_BLOCK_DOC,
  EMPTY_PARAGRAPH_DOC,
  MENTION_DOC,
  MISSING_ID_BOARD_MENTION_DOC,
  MISSING_ID_MENTION_DOC,
  MISSING_ID_SKILL_MENTION_DOC,
  MIXED_MENTION_DOC,
  PLAIN_PARAGRAPH_DOC,
  SKILL_MENTION_DOC,
  TASK_MENTION_DOC,
} from './tiptap-doc-to-cells.test-fixtures';

describe('feature: tiptap doc to cells', () => {
  test('happy: collapses a plain paragraph into a single text cell', () => {
    const cells = tipTapDocToCells(PLAIN_PARAGRAPH_DOC);
    expect(cells).toEqual([{ type: 'text', content: { text: 'hello world' } }]);
  });

  test('happy: splits a document mention into its own documentReference cell', () => {
    const cells = tipTapDocToCells(MENTION_DOC);
    expect(cells.map((cell) => cell.type)).toEqual(['text', 'documentReference', 'text']);
    const reference = cells[1];
    expect(reference?.type === 'documentReference' ? reference.content.documentId : null).toBe('doc-1');
  });

  test('happy: splits a board mention into its own boardReference cell', () => {
    const cells = tipTapDocToCells(BOARD_MENTION_DOC);
    expect(cells.map((cell) => cell.type)).toEqual(['text', 'boardReference', 'text']);
    const reference = cells[1];
    expect(reference?.type === 'boardReference' ? reference.content.boardId : null).toBe('board-1');
  });

  test('happy: renders a task mention into readable text', () => {
    const cells = tipTapDocToCells(TASK_MENTION_DOC);
    expect(cells).toEqual([{ type: 'text', content: { text: 'follow [task: QA checklist (id: task-1)]' } }]);
  });

  test('happy: preserves mixed document and board mention ordering', () => {
    const cells = tipTapDocToCells(MIXED_MENTION_DOC);
    expect(cells.map((cell) => cell.type)).toEqual(['text', 'documentReference', 'text', 'boardReference']);
  });

  test('happy: splits a skill mention into its own skillReference cell', () => {
    const cells = tipTapDocToCells(SKILL_MENTION_DOC);
    expect(cells.map((cell) => cell.type)).toEqual(['text', 'skillReference', 'text']);
    const reference = cells[1];
    expect(reference?.type === 'skillReference' ? reference.content.skillId : null).toBe('skills:1');
  });

  test('happy: drops skill mentions that lack a skillId', () => {
    expect(tipTapDocToCells(MISSING_ID_SKILL_MENTION_DOC)).toEqual([]);
  });

  test('happy: emits a code block cell with the declared language', () => {
    const cells = tipTapDocToCells(CODE_BLOCK_DOC);
    expect(cells).toEqual([{ type: 'codeBlock', content: { language: 'typescript', code: 'const x = 1;' } }]);
  });

  test('happy: returns an empty array for an empty document', () => {
    expect(tipTapDocToCells(EMPTY_PARAGRAPH_DOC)).toEqual([]);
  });

  test('happy: drops document mentions that lack a documentId', () => {
    expect(tipTapDocToCells(MISSING_ID_MENTION_DOC)).toEqual([]);
  });

  test('happy: drops board mentions that lack a boardId', () => {
    expect(tipTapDocToCells(MISSING_ID_BOARD_MENTION_DOC)).toEqual([]);
  });
});
