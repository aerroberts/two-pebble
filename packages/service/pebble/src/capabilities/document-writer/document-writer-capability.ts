import { NativeTool, ToolResponse } from '../../agent';
import type { DocumentListEntry, DocumentRunner } from '../../agent/document-runner';
import { Cell } from '../../thread';
import { AgentCapability } from '../agent-capability';
import { getCapabilityRunners } from '../runners';
import {
  listDocumentsSchema,
  readDocumentSchema,
  updateDocumentSchema,
  writeDocumentSchema,
} from './document-writer-schemas';

/**
 * Lets an agent create, update, read, and list documents in the local
 * document store. Writes go through the daemon-installed `DocumentRunner`,
 * which back-links every touched document to the calling agent so the
 * document editor UI can show which agents authored or edited it.
 *
 * Configuration is intentionally empty: any agent that holds this
 * capability can write to any document. Pinning is left for a future
 * scoped variant if it's ever needed.
 */
export class DocumentWriterCapability extends AgentCapability<Record<string, never>> {
  public readonly id = 'document-writer';
  public readonly description = 'Lets the agent create, update, read, and list documents.';

  public override hookOnRegister() {
    return {
      tools: [this.writeDocumentTool(), this.updateDocumentTool(), this.readDocumentTool(), this.listDocumentsTool()],
    };
  }

  private writeDocumentTool() {
    return new NativeTool({
      description:
        'Create a new document with a title and a Markdown body. Returns the new document id. The document is auto-linked to this agent.',
      name: 'write-document',
      schema: writeDocumentSchema,
    }).onInvoke(async (input) => {
      const runner = this.runner();
      if (runner === undefined) {
        return this.missingRunnerResponse();
      }
      try {
        const result = await runner.createDocument({ name: input.name, markdown: input.markdown });
        this.agent.emit('trace', {
          type: 'document-created',
          data: { documentId: result.id, documentName: result.name },
        });
        return ToolResponse.success([Cell.text(`Created document "${result.name}" (id: ${result.id}).`)]);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return ToolResponse.error(message, [Cell.text(`Failed to create document: ${message}`)]);
      }
    });
  }

  private updateDocumentTool() {
    return new NativeTool({
      description:
        'Update an existing document. Replaces the body with the supplied Markdown; optionally renames. The document is auto-linked to this agent.',
      name: 'update-document',
      schema: updateDocumentSchema,
    }).onInvoke(async (input) => {
      const runner = this.runner();
      if (runner === undefined) {
        return this.missingRunnerResponse();
      }
      try {
        const result = await runner.updateDocument({
          id: input.id,
          markdown: input.markdown,
          ...(input.name === undefined ? {} : { name: input.name }),
        });
        return ToolResponse.success([Cell.text(`Updated document "${result.name}" (id: ${result.id}).`)]);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return ToolResponse.error(message, [Cell.text(`Failed to update document: ${message}`)]);
      }
    });
  }

  private readDocumentTool() {
    return new NativeTool({
      description: 'Read a document by id and return its Markdown body.',
      name: 'read-document',
      schema: readDocumentSchema,
    }).onInvoke(async (input) => {
      const runner = this.runner();
      if (runner === undefined) {
        return this.missingRunnerResponse();
      }
      try {
        const result = await runner.readDocument({ id: input.id });
        return ToolResponse.success([
          Cell.text(`Document "${result.name}" (id: ${result.id}):`),
          Cell.codeBlock('markdown', result.markdown),
        ]);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return ToolResponse.error(message, [Cell.text(`Failed to read document: ${message}`)]);
      }
    });
  }

  private listDocumentsTool() {
    return new NativeTool({
      description: 'List documents in the document store, newest first.',
      name: 'list-documents',
      schema: listDocumentsSchema,
    }).onInvoke(async (input) => {
      const runner = this.runner();
      if (runner === undefined) {
        return this.missingRunnerResponse();
      }
      try {
        const result = await runner.listDocuments({
          ...(input.limit === undefined ? {} : { limit: input.limit }),
          ...(input.offset === undefined ? {} : { offset: input.offset }),
        });
        return ToolResponse.success([Cell.codeBlock('text', this.renderDocumentList(result.items, result.total))]);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return ToolResponse.error(message, [Cell.text(`Failed to list documents: ${message}`)]);
      }
    });
  }

  private missingRunnerResponse() {
    return ToolResponse.error('Document runner is not installed.', [Cell.text('Document runner is not installed.')]);
  }

  private runner(): DocumentRunner | undefined {
    return getCapabilityRunners(this.agent).documentWriter;
  }

  private renderDocumentList(items: DocumentListEntry[], total: number): string {
    if (items.length === 0) {
      return 'No documents.';
    }
    const lines = [`Documents (${items.length} of ${total}):`];
    for (const item of items) {
      lines.push(`- ${item.id}  ${new Date(item.updatedAt).toISOString()}  ${item.name}`);
    }
    return lines.join('\n');
  }
}
