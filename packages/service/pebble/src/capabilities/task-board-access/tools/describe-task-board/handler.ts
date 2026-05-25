import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { TaskBoardAccessCapability } from '../../capability';
import { renderBoardTree } from '../../utils/describe-board';

const schema = z.object({
  boardId: z.string().optional().describe('Task board id. Omit to use the active board.'),
});

/**
 * Builds the native tool that renders a task-board tree snapshot.
 */
export function buildDescribeTaskBoardTool(capability: TaskBoardAccessCapability) {
  return new NativeTool({
    description: 'Describe a task board.',
    name: 'describe-task-board',
    schema,
  }).onInvoke(async (input) => {
    const snapshot = await capability.bridge().describeBoard(capability.boardId(input.boardId));
    return ToolResponse.success([Cell.codeBlock('text', renderBoardTree(snapshot))]);
  });
}
