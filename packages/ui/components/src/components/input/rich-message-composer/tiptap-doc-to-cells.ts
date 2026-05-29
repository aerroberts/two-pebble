import type { JSONContent } from '@tiptap/core';
import { Cell, type CellContent } from '@two-pebble/pebble';

/**
 * Converts a TipTap composer document into the structured DataCell wire
 * format the daemon protocol accepts.
 *
 * Rules:
 * - Contiguous text/paragraph content is flushed as a single `text` cell so
 *   markdown-style formatting (paragraphs, hard breaks) round-trips.
 * - Each `documentMention` node becomes its own `documentReference` cell.
 *   The composer only knows `{ documentId, name }`; the daemon refreshes
 *   `contentSnapshot` and `documentUpdatedAt` from durable storage during
 *   event conversion.
 * - Each `boardMention` node becomes its own `boardReference` cell. The
 *   daemon refreshes `{ boardId, name }` from durable storage before the
 *   model sees it.
 * - Each `taskMention` node becomes readable text because the shared cell
 *   protocol does not have a dedicated task-reference cell yet.
 * - A `codeBlock` node maps to a code cell.
 *
 * Returning an empty array signals that the composer has nothing
 * sendable; callers should short-circuit submit in that case.
 */
export function tipTapDocToCells(doc: JSONContent): CellContent[] {
  const cells: CellContent[] = [];
  let textBuffer = '';

  const flushText = () => {
    const trimmed = textBuffer.replace(/\n+$/, '');
    if (trimmed.length > 0) {
      cells.push(Cell.text(trimmed));
    }
    textBuffer = '';
  };

  const visit = (node: JSONContent | undefined): void => {
    if (node === undefined) {
      return;
    }
    if (node.type === 'doc') {
      for (const child of node.content ?? []) {
        visit(child);
      }
      return;
    }
    if (node.type === 'paragraph') {
      for (const child of node.content ?? []) {
        visit(child);
      }
      textBuffer += '\n\n';
      return;
    }
    if (node.type === 'text') {
      textBuffer += node.text ?? '';
      return;
    }
    if (node.type === 'hardBreak') {
      textBuffer += '\n';
      return;
    }
    if (node.type === 'codeBlock') {
      flushText();
      const language = typeof node.attrs?.language === 'string' ? node.attrs.language : '';
      const code = (node.content ?? []).map((child) => child.text ?? '').join('');
      cells.push(Cell.codeBlock(language, code));
      return;
    }
    if (node.type === 'documentMention') {
      flushText();
      const documentId = typeof node.attrs?.documentId === 'string' ? node.attrs.documentId : '';
      const name = typeof node.attrs?.name === 'string' ? node.attrs.name : '';
      if (documentId.length === 0) {
        return;
      }
      cells.push(
        Cell.documentReference({
          documentId,
          name,
          contentSnapshot: '',
          documentUpdatedAt: 0,
        }),
      );
      return;
    }
    if (node.type === 'boardMention') {
      flushText();
      const boardId = typeof node.attrs?.boardId === 'string' ? node.attrs.boardId : '';
      const name = typeof node.attrs?.name === 'string' ? node.attrs.name : '';
      if (boardId.length === 0) {
        return;
      }
      cells.push(
        Cell.boardReference({
          boardId,
          name,
        }),
      );
      return;
    }
    if (node.type === 'taskMention') {
      const taskId = typeof node.attrs?.taskId === 'string' ? node.attrs.taskId : '';
      const name = typeof node.attrs?.name === 'string' ? node.attrs.name : '';
      textBuffer += `[task: ${name || taskId}${taskId.length > 0 ? ` (id: ${taskId})` : ''}]`;
      return;
    }
    if (node.type === 'skillMention') {
      flushText();
      const skillId = typeof node.attrs?.skillId === 'string' ? node.attrs.skillId : '';
      const name = typeof node.attrs?.name === 'string' ? node.attrs.name : '';
      if (skillId.length === 0) {
        return;
      }
      cells.push(
        Cell.skillReference({
          skillId,
          name,
        }),
      );
      return;
    }
    for (const child of node.content ?? []) {
      visit(child);
    }
  };

  visit(doc);
  flushText();
  return cells;
}
