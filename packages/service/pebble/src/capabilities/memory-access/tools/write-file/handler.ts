import { z } from 'zod';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { MemoryAccessCapability } from '../../capability';

const schema = z.object({
  memoryId: z.string().min(1).describe('Id of the memory collection to write to.'),
  file: z.string().min(1).describe('Collection-relative path of the file to write.'),
  body: z.string().describe('Contents to write. Replaces the file in full.'),
});

/**
 * Builds the native tool that creates or overwrites one file in a memory
 * collection through the agent bridge.
 */
export function buildWriteMemoryFileTool(capability: MemoryAccessCapability) {
  return new NativeTool({
    description: 'Create or overwrite one file in a memory collection by its memoryId and collection-relative path.',
    name: 'memory-write-file',
    schema,
  }).onInvoke(async (input) => {
    try {
      await capability.bridge.memories.writeFile({
        memoryId: input.memoryId,
        file: input.file,
        body: input.body,
      });
      return ToolResponse.success([Cell.text(`Wrote ${input.file} (${input.body.length} chars).`)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return ToolResponse.error(message, [Cell.text(`Failed to write memory file: ${message}`)]);
    }
  });
}
