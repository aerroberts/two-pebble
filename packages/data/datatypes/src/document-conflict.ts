/**
 * Compare-and-swap conflict signal for document content writes.
 *
 * Document saves pass the base revision (`updatedAt`) they were edited from.
 * When the stored row has moved on — another browser tab, or an agent editing
 * the same doc — the write is rejected instead of silently overwriting the
 * newer content (the old last-writer-wins behavior dropped edits).
 *
 * The signal has to survive the daemon bridge, which serializes thrown errors
 * down to their `message` string. So the conflict is encoded as a stable
 * message prefix that both the datastore (server) and the editor (client) can
 * recognize, regardless of the concrete Error subclass on either side.
 */
export const DOCUMENT_UPDATE_CONFLICT_CODE = 'DOCUMENT_UPDATE_CONFLICT';

/**
 * Builds the conflict error thrown by the document update operation when the
 * caller's expected revision no longer matches the stored row.
 */
export function documentUpdateConflictError(id: string): Error {
  return new Error(`${DOCUMENT_UPDATE_CONFLICT_CODE}: document ${id} changed since it was loaded`);
}

/**
 * True when an error (including a bridge-relayed error reconstructed on the
 * client) represents a document write conflict, so callers can reconcile
 * instead of treating it as a hard failure.
 */
export function isDocumentUpdateConflictError(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith(`${DOCUMENT_UPDATE_CONFLICT_CODE}:`);
}
