import type { Datastore } from '@two-pebble/datastore';
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
      resolved.push(
        Cell.documentReference({
          documentId: row.id,
          name: row.name,
          contentSnapshot: row.content,
          documentUpdatedAt: row.updatedAt,
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
