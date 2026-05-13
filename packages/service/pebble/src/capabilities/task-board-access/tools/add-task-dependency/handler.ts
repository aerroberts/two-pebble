import { z } from 'zod/v4';
import type { TaskBoardRunner } from '../../../../agent';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';

const schema = z.object({
  fromTaskId: z.string().describe('Task that depends on the other. Becomes the upstream side.'),
  toTaskId: z.string().describe('Task that must complete first. Becomes the downstream side.'),
});

export function buildAddTaskDependencyTool(runner: TaskBoardRunner, boardId: string) {
  return new NativeTool({
    description:
      'Adds a dependency edge so `fromTaskId` is blocked until `toTaskId` reaches a terminal status. Both tasks must already exist on the locked board.',
    name: 'add-task-dependency',
    schema,
  }).onInvoke(async (input) => {
    await runner.addDependency({ boardId, fromTaskId: input.fromTaskId, toTaskId: input.toTaskId });
    return ToolResponse.success([Cell.text(`Added dependency ${input.fromTaskId} → ${input.toTaskId}.`)]);
  });
}
