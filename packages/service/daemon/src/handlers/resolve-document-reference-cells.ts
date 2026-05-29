import type { Datastore } from '@two-pebble/datastore';
import { type DocumentTodo, extractTodos, type TipTapDocument } from '@two-pebble/datatypes';
import type { Logger } from '@two-pebble/logger';
import { Cell, type CellContent } from '@two-pebble/pebble';
import { gatherMemoryNavigation } from '../utils/memories/gather-memory-navigation';

export interface ResolveDocumentReferenceCellsInput {
  cells: CellContent[];
  datastore: Datastore;
  logger: Logger;
}

/**
 * Walks the cell list and re-resolves reference cells against durable
 * storage. Document references receive the current content snapshot and
 * board references receive the current board id/name summary. If a target
 * was deleted between composer insertion and submission, the cell is
 * rewritten as a plain text marker.
 *
 * When the resolved content is valid TipTap JSON, this also extracts the
 * full todo list (open + terminal) and attaches it to the cell. The full
 * list is preserved so the daemon's `<open-tasks>` gating can filter
 * later; downstream consumers that don't care about todos simply ignore
 * the new field.
 */
export async function resolveReferenceCells(input: ResolveDocumentReferenceCellsInput): Promise<CellContent[]> {
  const resolved: CellContent[] = [];
  for (const cell of input.cells) {
    if (cell.type === 'documentReference') {
      try {
        const row = await input.datastore.documents.read({ id: cell.content.documentId });
        const todos = safeExtractTodos(row.content, row.id, input.logger);
        resolved.push(
          Cell.documentReference({
            documentId: row.id,
            name: row.name,
            contentSnapshot: row.content,
            documentUpdatedAt: row.updatedAt,
            ...(todos === undefined ? {} : { todos }),
          }),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        input.logger.warn('document reference resolution failed', {
          documentId: cell.content.documentId,
          error: message,
        });
        resolved.push(Cell.text(`[document ${cell.content.name} (id: ${cell.content.documentId}) is unavailable]`));
      }
      continue;
    }
    if (cell.type === 'boardReference') {
      try {
        const row = await input.datastore.taskBoards.read({ id: cell.content.boardId });
        resolved.push(
          Cell.boardReference({
            boardId: row.id,
            name: row.name,
          }),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        input.logger.warn('board reference resolution failed', {
          boardId: cell.content.boardId,
          error: message,
        });
        resolved.push(Cell.text(`[board ${cell.content.name} (id: ${cell.content.boardId}) is unavailable]`));
      }
      continue;
    }
    if (cell.type === 'memoryReference') {
      try {
        const row = await input.datastore.memories.read({ id: cell.content.memoryId });
        const navigation = await gatherMemoryNavigation(row.path);
        resolved.push(
          Cell.memoryReference({
            memoryId: row.id,
            name: row.name,
            unavailable: navigation.unavailable,
            files: navigation.files,
            ...(navigation.index === undefined ? {} : { index: navigation.index }),
          }),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        input.logger.warn('memory reference resolution failed', {
          memoryId: cell.content.memoryId,
          error: message,
        });
        resolved.push(Cell.text(`[memory ${cell.content.name} (id: ${cell.content.memoryId}) is unavailable]`));
      }
      continue;
    }
    resolved.push(cell);
  }
  return resolved;
}

export const resolveDocumentReferenceCells = resolveReferenceCells;

function safeExtractTodos(rawContent: string, documentId: string, logger: Logger): DocumentTodo[] | undefined {
  try {
    const parsed = JSON.parse(rawContent) as TipTapDocument;
    return extractTodos(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn('document todo extraction failed', { documentId, error: message });
    return undefined;
  }
}
