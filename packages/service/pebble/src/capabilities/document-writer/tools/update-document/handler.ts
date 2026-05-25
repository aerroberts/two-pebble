import { z } from 'zod';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { DocumentWriterCapability } from '../../capability';

const schema = z.object({
  id: z.string().min(1).describe('Document id to update.'),
  markdown: z.string().describe('Replacement Markdown body.'),
  name: z.string().min(1).optional().describe('Optional replacement title.'),
});

/**
 * Builds the native tool that updates a document through the agent bridge.
 */
export function buildUpdateDocumentTool(capability: DocumentWriterCapability) {
  return new NativeTool({
    description:
      'Update an existing document. Replaces the body with the supplied Markdown; optionally renames. The document is auto-linked to this agent.',
    name: 'update-document',
    schema,
  }).onInvoke(async (input) => {
    try {
      const result = await capability.bridge.documents.update({
        id: input.id,
        markdown: input.markdown,
        ...(input.name === undefined ? {} : { name: input.name }),
      });
      capability.traceDocumentUpdated(result);
      return ToolResponse.success([Cell.text(`Updated document "${result.name}" (id: ${result.id}).`)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return ToolResponse.error(message, [Cell.text(`Failed to update document: ${message}`)]);
    }
  });
}
