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
