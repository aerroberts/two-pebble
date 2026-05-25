import { z } from 'zod';
import type { DocumentListEntry } from '../../../../agent';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { DocumentWriterCapability } from '../../capability';

const schema = z.object({
  limit: z.number().int().positive().optional().describe('Maximum number of documents to return.'),
  offset: z.number().int().nonnegative().optional().describe('Pagination offset.'),
});

/**
 * Builds the native tool that lists documents through the agent bridge.
 */
export function buildListDocumentsTool(capability: DocumentWriterCapability) {
  return new NativeTool({
    description: 'List documents in the document store, newest first.',
    name: 'list-documents',
    schema,
  }).onInvoke(async (input) => {
    try {
      const result = await capability.bridge.documents.list({
        ...(input.limit === undefined ? {} : { limit: input.limit }),
        ...(input.offset === undefined ? {} : { offset: input.offset }),
      });
      return ToolResponse.success([Cell.codeBlock('text', renderDocumentList(result.items, result.total))]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return ToolResponse.error(message, [Cell.text(`Failed to list documents: ${message}`)]);
    }
  });
}

function renderDocumentList(items: DocumentListEntry[], total: number): string {
  if (items.length === 0) {
    return 'No documents.';
  }
  const lines = [`Documents (${items.length} of ${total}):`];
  for (const item of items) {
    lines.push(`- ${item.id}  ${new Date(item.updatedAt).toISOString()}  ${item.name}`);
  }
  return lines.join('\n');
}
