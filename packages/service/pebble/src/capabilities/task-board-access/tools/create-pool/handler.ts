import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { TaskBoardAccessCapability } from '../../capability';

const schema = z.object({
  name: z.string().describe('Group (pool) name.'),
  parentPoolId: z.string().optional().describe('Optional parent group id. Omit to put the group at the board root.'),
  dependsOn: z.array(z.string()).optional().describe('Optional sibling group ids this group depends on.'),
});

export function buildCreatePoolTool(capability: TaskBoardAccessCapability) {
  return new NativeTool({
    description:
      'Creates a new group (pool) on the locked board. Groups can nest and can declare dependencies on siblings.',
    name: 'create-pool',
    schema,
  }).onInvoke(async (input) => {
    const result = await capability.bridge.taskBoards.createPool({
      boardId: capability.boardId(undefined),
      name: input.name,
      ...(input.parentPoolId === undefined ? {} : { parentPoolId: input.parentPoolId }),
      ...(input.dependsOn === undefined ? {} : { dependsOn: input.dependsOn }),
    });
    return ToolResponse.success([Cell.text(`Created group ${result.id}: ${input.name}`)]);
  });
}
