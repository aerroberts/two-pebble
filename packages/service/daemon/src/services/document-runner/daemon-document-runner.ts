import type { Datastore } from '@two-pebble/datastore';
import {
  appendAgentReference,
  markdownToTipTap,
  parseDocumentReferences,
  serializeDocumentReferences,
  type TipTapDocument,
  tipTapToMarkdown,
} from '@two-pebble/datatypes';
import type { Logger } from '@two-pebble/logger';
import type {
  DocumentCreateInput,
  DocumentListInput,
  DocumentListOutput,
  DocumentReadInput,
  DocumentReadOutput,
  DocumentRunner,
  DocumentSummary,
  DocumentUpdateInput,
} from '@two-pebble/pebble';
import type { DaemonBridge } from '../../types';

interface DaemonDocumentRunnerContext {
  agentId: string;
  bridge: DaemonBridge;
  datastore: Datastore;
  logger: Logger;
}

const DEFAULT_LIST_LIMIT = 50;

/**
 * Daemon implementation of the `DocumentRunner` contract used by the
 * `document-writer` capability. Owns the agent id so every write goes out
 * with an `agent` back-reference appended to the document's `references`
 * column (idempotent — re-edits by the same agent don't grow the array).
 * All mutations are also fanned out via `documentUpdated` so any open
 * editor stays in sync.
 */
export class DaemonDocumentRunner implements DocumentRunner {
  private readonly agentId: string;
  private readonly bridge: DaemonBridge;
  private readonly datastore: Datastore;
  private readonly logger: Logger;

  public constructor(context: DaemonDocumentRunnerContext) {
    this.agentId = context.agentId;
    this.bridge = context.bridge;
    this.datastore = context.datastore;
    this.logger = context.logger;
  }

  public async createDocument(input: DocumentCreateInput): Promise<DocumentSummary> {
    const content = JSON.stringify(markdownToTipTap(input.markdown));
    const references = serializeDocumentReferences(appendAgentReference([], this.agentId, Date.now()));
    const record = await this.datastore.documents.create({ name: input.name, content, references });
    this.bridge.emit('documentUpdated', record);
    this.logger.info('document created by agent', {
      agentId: this.agentId,
      documentId: record.id,
      name: record.name,
    });
    return { id: record.id, name: record.name };
  }

  public async updateDocument(input: DocumentUpdateInput): Promise<DocumentSummary> {
    const existing = await this.datastore.documents.read({ id: input.id });
    const nextRefs = appendAgentReference(parseDocumentReferences(existing.references), this.agentId, Date.now());
    const content = JSON.stringify(markdownToTipTap(input.markdown));
    const record = await this.datastore.documents.update({
      id: input.id,
      content,
      ...(input.name === undefined ? {} : { name: input.name }),
      references: serializeDocumentReferences(nextRefs),
    });
    this.bridge.emit('documentUpdated', record);
    this.logger.info('document updated by agent', {
      agentId: this.agentId,
      documentId: record.id,
    });
    return { id: record.id, name: record.name };
  }

  public async readDocument(input: DocumentReadInput): Promise<DocumentReadOutput> {
    const record = await this.datastore.documents.read({ id: input.id });
    const tipTap = JSON.parse(record.content) as TipTapDocument;
    return { id: record.id, name: record.name, markdown: tipTapToMarkdown(tipTap) };
  }

  public async listDocuments(input: DocumentListInput): Promise<DocumentListOutput> {
    const result = await this.datastore.documents.list({
      limit: input.limit ?? DEFAULT_LIST_LIMIT,
      offset: input.offset ?? 0,
    });
    return {
      items: result.items.map((item) => ({ id: item.id, name: item.name, updatedAt: item.updatedAt })),
      total: result.page.total,
    };
  }
}
