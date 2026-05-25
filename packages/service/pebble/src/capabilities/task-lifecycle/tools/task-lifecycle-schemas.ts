import { z } from 'zod/v4';

export const completeTaskSchema = z.object({
  reason: z.string().optional().describe('Short note explaining why the task is complete.'),
});

export const failTaskSchema = z.object({
  reason: z.string().describe('Short note explaining why the task cannot be completed.'),
});

export const submitDeliverableSchema = z.object({
  deliverableId: z.string(),
  payload: z.discriminatedUnion('type', [
    z.object({ type: z.literal('text'), content: z.string().min(1) }),
    z.object({ type: z.literal('pr_url'), url: z.string().url() }),
  ]),
});
