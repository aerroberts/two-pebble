import { z } from 'zod/v4';

export const completeTaskSchema = z.object({
  reason: z.string().optional().describe('Short note explaining why the task is complete.'),
});

export const failTaskSchema = z.object({
  reason: z.string().describe('Short note explaining why the task cannot be completed.'),
});
