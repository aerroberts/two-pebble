import { z } from 'zod';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { DocumentWriterCapability } from '../../capability';

const schema = z.object({
  name: z.string().min(1).describe('Document title.'),
  markdown: z.string().describe('Markdown body for the new document.'),
});

/**
 * Builds the native tool that creates a document through the agent bridge.
 */
export function buildWriteDocumentTool(capability: DocumentWriterCapability) {
  return new NativeTool({
    description:
      'Create a new document with a title and a Markdown body. Returns the new document id. The document is auto-linked to this agent.',
    name: 'write-document',
    schema,
  }).onInvoke(async (input) => {
    const bridge = capability.bridge();
    if (bridge === undefined) {
      return missingBridgeResponse();
    }
    try {
      const result = await bridge.createDocument({ name: input.name, markdown: input.markdown });
      capability.traceDocumentCreated(result);
      return ToolResponse.success([Cell.text(`Created document "${result.name}" (id: ${result.id}).`)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return ToolResponse.error(message, [Cell.text(`Failed to create document: ${message}`)]);
    }
  });
}

function missingBridgeResponse() {
  return ToolResponse.error('Document bridge is not installed.', [Cell.text('Document bridge is not installed.')]);
}
