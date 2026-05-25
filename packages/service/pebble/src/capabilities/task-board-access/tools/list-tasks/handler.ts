import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { TaskBoardAccessCapability } from '../../capability';
import { renderTaskList } from '../../utils/describe-board';

const schema = z.object({
  boardId: z.string().optional().describe('Task board id. Omit to use the active board.'),
});

/**
 * Builds the native tool that lists tasks on a board.
 */
export function buildListTasksTool(capability: TaskBoardAccessCapability) {
  return new NativeTool({
    description: 'List every task on a task board with id, name, status, and pool.',
    name: 'list-tasks',
    schema,
  }).onInvoke(async (input) => {
    const snapshot = await capability.bridge.taskBoards.describe({ boardId: capability.boardId(input.boardId) });
    return ToolResponse.success([Cell.codeBlock('text', renderTaskList(snapshot.tasks))]);
  });
}
