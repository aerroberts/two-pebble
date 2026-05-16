/**
 * Typed back-pointers stored on a document. The shape is a discriminated
 * union on `type` so future reference kinds (task, workspace, etc.) can be
 * added without a schema change — the column is a JSON array of values
 * shaped like the variants below.
 */
export type DocumentReference = DocumentAgentReference;

/**
 * Reference variant for documents that mention or bind to an agent.
 * The `targetId` points at the agent record and `createdAt` captures
 * when the reference was first introduced into the document.
 */
export interface DocumentAgentReference {
  type: 'agent';
  targetId: string;
  createdAt: number;
}

/**
 * Parses the serialized reference list stored with a document.
 * Invalid JSON, non-array payloads, and unknown reference variants are
 * treated as an empty or filtered reference set.
 */
export function parseDocumentReferences(serialized: string): DocumentReference[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) {
    return [];
  }
  const result: DocumentReference[] = [];
  for (const entry of parsed) {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      continue;
    }
    const record = entry as Record<string, unknown>;
    if (record.type !== 'agent') {
      continue;
    }
    if (typeof record.targetId !== 'string' || typeof record.createdAt !== 'number') {
      continue;
    }
    result.push({ type: 'agent', targetId: record.targetId, createdAt: record.createdAt });
  }
  return result;
}

/**
 * Serializes document references for storage.
 * The references are already validated by callers, so this preserves the
 * discriminated union shape without further normalization.
 */
export function serializeDocumentReferences(refs: DocumentReference[]): string {
  return JSON.stringify(refs);
}

/**
 * Adds an agent reference if one with the same `targetId` isn't already
 * present. Returns a new array — callers should treat refs as immutable.
 * Keeps the existing `createdAt` on duplicates so the first-touched
 * timestamp survives subsequent edits.
 */
export function appendAgentReference(refs: DocumentReference[], agentId: string, now: number): DocumentReference[] {
  for (const ref of refs) {
    if (ref.type === 'agent' && ref.targetId === agentId) {
      return refs;
    }
  }
  return [...refs, { type: 'agent', targetId: agentId, createdAt: now }];
}
