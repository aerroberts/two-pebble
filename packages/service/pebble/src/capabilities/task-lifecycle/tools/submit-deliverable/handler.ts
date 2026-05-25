import { z } from 'zod/v4';
import { NativeTool } from '../../../../agent';
import type { TaskLifecycleCapability } from '../../capability';

const schema = z.object({
  deliverableId: z.string().min(1).describe('Required deliverable id to submit.'),
  payload: z.discriminatedUnion('type', [
    z.object({ type: z.literal('text'), content: z.string().min(1) }),
    z.object({ type: z.literal('pr_url'), url: z.string().url() }),
  ]),
});

/**
 * Builds the native tool that submits one required task deliverable.
 */
export function buildSubmitDeliverableTool(capability: TaskLifecycleCapability) {
  return new NativeTool({
    description: 'Submit one required deliverable for the assigned task.',
    name: 'submit-deliverable',
    schema,
  }).onInvoke(async (input) => capability.submitDeliverable(input));
}
