import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { TaskBoardAccessCapability } from '../../capability';

const schema = z.object({
  poolId: z.string().describe('Group (pool) id to delete.'),
});

export function buildDeletePoolTool(capability: TaskBoardAccessCapability) {
  return new NativeTool({
    description:
      'Permanently deletes a group from the locked board. Every task and child group it contains is also deleted.',
    name: 'delete-pool',
    schema,
  }).onInvoke(async (input) => {
    await capability.bridge().deletePool({ boardId: capability.boardId(undefined), poolId: input.poolId });
    return ToolResponse.success([Cell.text(`Deleted group ${input.poolId}.`)]);
  });
}
