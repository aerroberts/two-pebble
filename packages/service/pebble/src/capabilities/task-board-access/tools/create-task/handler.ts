import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { TaskBoardAccessCapability } from '../../capability';

const schema = z.object({
  boardId: z.string().optional().describe('Task board id. Omit to use the active board.'),
  name: z.string().min(1).describe('Task name.'),
  description: z.string().optional().describe('Detailed task description.'),
  poolId: z.string().nullable().optional().describe('Optional pool id, or null for root.'),
  dependsOn: z.array(z.string()).optional().describe('Task ids that must complete before this task.'),
});

/**
 * Builds the native tool that creates a task on a board.
 */
export function buildCreateTaskTool(capability: TaskBoardAccessCapability) {
  return new NativeTool({
    description: 'Create a task on a task board.',
    name: 'create-task',
    schema,
  }).onInvoke(async (input) => {
    const result = await capability.bridge().createTask({
      boardId: capability.boardId(input.boardId),
      name: input.name,
      ...(input.description === undefined ? {} : { description: input.description }),
      ...(input.poolId === undefined ? {} : { poolId: input.poolId }),
      ...(input.dependsOn === undefined ? {} : { dependsOn: input.dependsOn }),
    });
    return ToolResponse.success([Cell.text(`Created task ${result.id}.`)]);
  });
}
