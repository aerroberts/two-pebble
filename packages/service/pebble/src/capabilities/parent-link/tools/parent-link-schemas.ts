import { z } from 'zod/v4';

export const notifyParentSchema = z.object({
  message: z.string(),
  expectsReply: z.boolean().optional(),
});

export const parentMessageSchema = z.object({
  message: z.string(),
});

export const readParentMessagesSchema = z.object({});
