import { z } from 'zod';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { DocumentWriterCapability } from '../../capability';

const schema = z.object({
  name: z.string().min(1).describe('Document title.'),
  markdown: z.string().describe('Markdown body for the new document.'),
  section: z
    .string()
    .optional()
    .describe(
      'Optional folder / category label to file the document under in the sidebar. ' +
        'Sections are free-form strings; passing a name not yet in use creates that section. ' +
        'Omit to keep the document in the unsectioned default bucket.',
    ),
});

/**
 * Builds the native tool that creates a document through the agent bridge.
 */
export function buildWriteDocumentTool(capability: DocumentWriterCapability) {
  return new NativeTool({
    description:
      'Create a new document with a title, a Markdown body, and an optional section label. Returns the new document id. The document is auto-linked to this agent.',
    name: 'write-document',
    schema,
  }).onInvoke(async (input) => {
    try {
      const section = input.section?.trim();
      const result = await capability.bridge.documents.create({
        name: input.name,
        markdown: input.markdown,
        ...(section === undefined || section.length === 0 ? {} : { section }),
      });
      capability.traceDocumentCreated(result);
      return ToolResponse.success([Cell.text(`Created document "${result.name}" (id: ${result.id}).`)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return ToolResponse.error(message, [Cell.text(`Failed to create document: ${message}`)]);
    }
  });
}
