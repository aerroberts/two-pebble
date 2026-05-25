import { z } from 'zod/v4';
import writeDocumentMarkdownPrompt from '../prompts/write-document-markdown-field.md?raw';

export const writeDocumentSchema = z.object({
  name: z.string().min(1).describe('Document title. Shown in the documents sidebar.'),
  markdown: z.string().describe(writeDocumentMarkdownPrompt),
});

export const updateDocumentSchema = z.object({
  id: z.string().describe('Document id to update.'),
  markdown: z.string().describe('Full document body in Markdown. Replaces the prior content entirely.'),
  name: z.string().optional().describe('Optional new title. Omit to leave the existing title unchanged.'),
});

export const readDocumentSchema = z.object({
  id: z.string().describe('Document id to read.'),
});

export const listDocumentsSchema = z.object({
  limit: z.number().int().positive().max(200).optional().describe('Maximum documents to return. Defaults to 50.'),
  offset: z.number().int().nonnegative().optional().describe('Documents to skip. Defaults to 0.'),
});
