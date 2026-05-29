import { z } from 'zod';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { MemoryAccessCapability } from '../../capability';

const schema = z.object({
  memoryId: z.string().min(1).describe('Id of the memory collection to read from.'),
  file: z.string().min(1).describe('Collection-relative path of the file to read.'),
});

/**
 * Builds the native tool that reads one file from a memory collection
 * through the agent bridge.
 */
export function buildReadMemoryFileTool(capability: MemoryAccessCapability) {
  return new NativeTool({
    description: 'Read one file from a memory collection by its memoryId and collection-relative path.',
    name: 'memory-read-file',
    schema,
  }).onInvoke(async (input) => {
    try {
      const content = await capability.bridge.memories.readFile({ memoryId: input.memoryId, file: input.file });
      return ToolResponse.success([Cell.text(`${input.file}:`), Cell.codeBlock('', content)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return ToolResponse.error(message, [Cell.text(`Failed to read memory file: ${message}`)]);
    }
  });
}
