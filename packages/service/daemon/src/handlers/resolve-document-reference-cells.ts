import type { Datastore } from '@two-pebble/datastore';
import { type DocumentTodo, extractTodos, type TipTapDocument } from '@two-pebble/datatypes';
import type { Logger } from '@two-pebble/logger';
import { Cell, type CellContent } from '@two-pebble/pebble';

export interface ResolveDocumentReferenceCellsInput {
  cells: CellContent[];
  datastore: Datastore;
  logger: Logger;
}

/**
 * Walks the cell list and re-resolves any `documentReference` cells against
 * the durable document store so the snapshot the agent sees reflects the
 * document's current content. If the document was deleted between composer
 * insertion and submission, the cell is rewritten as a plain text marker.
 *
 * When the resolved content is valid TipTap JSON, this also extracts the
 * full todo list (open + terminal) and attaches it to the cell. The full
 * list is preserved so the daemon's `<open-tasks>` gating can filter
 * later; downstream consumers that don't care about todos simply ignore
 * the new field.
 */
export async function resolveDocumentReferenceCells(input: ResolveDocumentReferenceCellsInput): Promise<CellContent[]> {
  const resolved: CellContent[] = [];
  for (const cell of input.cells) {
    if (cell.type !== 'documentReference') {
      resolved.push(cell);
      continue;
    }
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
  }
  return resolved;
}

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
