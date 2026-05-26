import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { GithubCapability } from '../../capability';

const schema = z.object({
  deliverableId: z.string().min(1).describe('Task deliverable id that expects a pr_url payload.'),
  url: z.string().url().describe('GitHub pull request URL.'),
});

export function buildSubmitPrTool(capability: GithubCapability) {
  return new NativeTool({
    description: 'Submit a GitHub pull request URL for an owned task deliverable and wait for PR lifecycle updates.',
    name: 'submit-pr',
    schema,
  }).onInvoke(async (input) => capability.submitPr(input));
}
