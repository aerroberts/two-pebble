import { describe, expect, test } from 'bun:test';
import { renderBoardReferenceText } from './render-board-reference';

describe('feature: board reference rendering', () => {
  test('happy: emits a compact board id and name summary', () => {
    expect(renderBoardReferenceText({ boardId: 'board-1', name: 'Launch Board' })).toBe(
      '[board: Launch Board (id: board-1)]',
    );
  });
});
