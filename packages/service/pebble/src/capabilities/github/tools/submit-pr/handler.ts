import { z } from 'zod/v4';
import { NativeTool, ToolResponse } from '../../../../agent';
import { Cell } from '../../../../thread';
import type { GithubCapability } from '../../capability';

const schema = z.object({
  taskId: z.string().min(1).describe('The task that owns the deliverable.'),
  deliverableId: z.string().min(1).describe('The pr_url deliverable id this PR satisfies.'),
  url: z.string().url().describe('GitHub pull request URL.'),
});

export function buildSubmitPrTool(capability: GithubCapability) {
  return new NativeTool({
    description: 'Attach a GitHub pull request URL to a task pr_url deliverable; the daemon tracks it until it merges.',
    name: 'submit-pr',
    schema,
  }).onInvoke(async (input) => {
    const row = await capability.bridge.github.submitPr(input);
    return ToolResponse.success([
      Cell.text(`Tracking PR ${row.repo}#${row.number} for deliverable ${row.deliverableId}.`),
    ]);
  });
}
