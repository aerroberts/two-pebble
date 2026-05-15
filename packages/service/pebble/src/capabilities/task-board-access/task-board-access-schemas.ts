import { z } from 'zod/v4';

export const boardSchema = z.object({
  boardId: z.string().optional(),
});

export const createTaskSchema = z.object({
  boardId: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  poolId: z.string().nullable().optional(),
  dependsOn: z.array(z.string()).optional(),
});

export const setStatusSchema = z.object({
  boardId: z.string().optional(),
  taskId: z.string(),
  status: z.enum(['working', 'waiting', 'success', 'failure']),
  reason: z.string(),
});

export const listTasksSchema = z.object({
  boardId: z.string().optional(),
});

export const updateTaskSchema = z.object({
  boardId: z.string().optional(),
  taskId: z.string().describe('Task id to update.'),
  name: z.string().optional().describe('Optional new name. Omit to leave the name unchanged.'),
  description: z
    .string()
    .optional()
    .describe(
      'Optional new description. Omit to leave the description unchanged. When provided, replaces the prior value in full.',
    ),
  status: z
    .enum(['working', 'waiting', 'success', 'failure'])
    .optional()
    .describe('Optional new status. Omit to leave the status unchanged.'),
  reason: z.string().optional().describe('Reason recorded on the status change. Required when `status` is provided.'),
});
