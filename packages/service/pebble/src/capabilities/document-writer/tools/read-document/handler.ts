import { z } from 'zod';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { DocumentWriterCapability } from '../../capability';

const schema = z.object({
  id: z.string().min(1).describe('Document id to read.'),
});

/**
 * Builds the native tool that reads a document through the agent bridge.
 */
export function buildReadDocumentTool(capability: DocumentWriterCapability) {
  return new NativeTool({
    description: 'Read a document by id and return its Markdown body.',
    name: 'read-document',
    schema,
  }).onInvoke(async (input) => {
    try {
      const result = await capability.bridge.documents.read({ id: input.id });
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
