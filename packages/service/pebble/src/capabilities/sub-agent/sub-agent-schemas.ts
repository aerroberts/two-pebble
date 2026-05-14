import { z } from 'zod/v4';
import type { SubAgentReference } from './sub-agent-types';

export const sendSubAgentSchema = z.object({
  childAgentId: z.string().describe('Full spawned child agent id, including the agents: prefix.'),
  message: z.string(),
});

export const askSubAgentSchema = z.object({
  childAgentId: z.string().describe('Full spawned child agent id, including the agents: prefix.'),
  message: z.string(),
});

export const childAgentSchema = z.object({
  childAgentId: z.string().describe('Full spawned child agent id, including the agents: prefix.'),
});

export const killSubAgentSchema = z.object({
  childAgentId: z.string().describe('Full spawned child agent id, including the agents: prefix.'),
  reason: z.string(),
});

export const listSubAgentsSchema = z.object({});

export function referenceNameSchema(references: SubAgentReference[]) {
  const names = references.map((reference) => reference.name);
  if (names.length === 0) {
    return z.string().describe('Configured sub-agent reference name.');
  }
  return z.enum(names as [string, ...string[]]).describe('Configured sub-agent reference name.');
}
