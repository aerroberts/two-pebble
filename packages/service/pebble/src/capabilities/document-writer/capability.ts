import { AgentCapability } from '../agent-capability';
import { buildListDocumentsTool } from './tools/list-documents/handler';
import { buildReadDocumentTool } from './tools/read-document/handler';
import { buildUpdateDocumentTool } from './tools/update-document/handler';
import { buildWriteDocumentTool } from './tools/write-document/handler';

/**
 * Lets an agent create, update, read, and list documents in the local
 * document store. Writes go through the daemon-installed document bridge,
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
      tools: [
        buildWriteDocumentTool(this),
        buildUpdateDocumentTool(this),
        buildReadDocumentTool(this),
        buildListDocumentsTool(this),
      ],
    };
  }
  public traceDocumentCreated(input: { id: string; name: string }): void {
    this.agent.emit('trace', {
      type: 'document-created',
      data: { documentId: input.id, documentName: input.name },
    });
  }

  public traceDocumentUpdated(input: { id: string; name: string }): void {
    this.agent.emit('trace', {
      type: 'document-updated',
      data: { documentId: input.id, documentName: input.name },
    });
  }
}
