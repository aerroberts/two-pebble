import { z } from 'zod/v4';
import type { TaskBoardRunner } from '../../../../agent';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';

const schema = z.object({
  poolId: z.string().describe('Group (pool) id to delete.'),
});

export function buildDeletePoolTool(runner: TaskBoardRunner, boardId: string) {
  return new NativeTool({
    description:
      'Permanently deletes a group from the locked board. Every task and child group it contains is also deleted.',
    name: 'delete-pool',
    schema,
  }).onInvoke(async (input) => {
    await runner.deletePool({ boardId, poolId: input.poolId });
    return ToolResponse.success([Cell.text(`Deleted group ${input.poolId}.`)]);
  });
}
