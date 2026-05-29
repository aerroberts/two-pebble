import { z } from 'zod';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { MemoryAccessCapability } from '../../capability';

const schema = z.object({
  memoryId: z.string().min(1).describe('Id of the memory collection to list.'),
});

/**
 * Builds the native tool that lists every file in a memory collection
 * through the agent bridge.
 */
export function buildListMemoryFilesTool(capability: MemoryAccessCapability) {
  return new NativeTool({
    description: 'List every file in a memory collection by its memoryId.',
    name: 'memory-list-files',
    schema,
  }).onInvoke(async (input) => {
    try {
      const files = await capability.bridge.memories.listFiles({ memoryId: input.memoryId });
      const body = files.length === 0 ? '(no files)' : files.map((file) => `- ${file}`).join('\n');
      return ToolResponse.success([Cell.text(`Files in ${input.memoryId}:`), Cell.text(body)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return ToolResponse.error(message, [Cell.text(`Failed to list memory files: ${message}`)]);
    }
  });
}
