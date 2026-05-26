import type { Datastore } from '@two-pebble/datastore';
import {
  extractAgentSystemPromptDocumentReferences,
  renderAgentSystemPromptToText,
  type TipTapDocument,
  type TipTapNode,
  tipTapToMarkdown,
} from '@two-pebble/datatypes';
import { logger } from '@two-pebble/logger';
import { renderAgentNamingInstruction, renderPebbleAgentNamingInstruction } from '@two-pebble/pebble';

interface RenderAgentRegistrySystemPromptInput {
  agentId: string;
  datastore: Datastore;
  kind: 'framework' | 'pebble';
  systemPrompt: TipTapDocument;
}

/**
 * Renders the registry system prompt into the exact text given to a runtime
 * agent. Document mentions are expanded in place with full document markdown
 * blocks so a prompt that is only a reference still gives the model context.
 */
export async function renderAgentRegistrySystemPrompt(input: RenderAgentRegistrySystemPromptInput): Promise<string> {
  const naming =
    input.kind === 'framework'
      ? renderAgentNamingInstruction(input.agentId)
      : renderPebbleAgentNamingInstruction(input.agentId);
  const body = await renderSystemPromptBody(input);
  if (body.length === 0) {
    return naming;
  }
  return `${naming}\n\n${body}`;
}

async function renderSystemPromptBody(input: RenderAgentRegistrySystemPromptInput): Promise<string> {
  const base = renderAgentSystemPromptToText(input.systemPrompt);
  const references = extractAgentSystemPromptDocumentReferences(input.systemPrompt);
  const blocks: string[] = [];
  for (const reference of references) {
    try {
      const row = await input.datastore.documents.read({ id: reference.documentId });
      blocks.push(renderDocumentBlock({ content: row.content, documentId: row.id, name: row.name }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn('agent registry system prompt document reference failed', {
        documentId: reference.documentId,
        error: message,
      });
      blocks.push(`[document ${reference.name} (id: ${reference.documentId}) is unavailable]`);
    }
  }
  return [base, ...blocks].filter((part) => part.trim().length > 0).join('\n\n');
}

function renderDocumentBlock(input: { content: string; documentId: string; name: string }): string {
  return [
    `<document-reference name="${escapeAttribute(input.name)}" id="${escapeAttribute(input.documentId)}">`,
    '```md',
    renderDocumentContentMarkdown(input.content),
    '```',
    '</document-reference>',
  ].join('\n');
}

function renderDocumentContentMarkdown(content: string): string {
  try {
    const parsed = JSON.parse(content) as TipTapDocument;
    if (parsed.type === 'doc') {
      try {
        return tipTapToMarkdown(parsed).trim();
      } catch {
        return renderTipTapMarkdown(parsed).trim();
      }
    }
  } catch {
    return content.trim();
  }
  return content.trim();
}

function escapeAttribute(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function renderTipTapMarkdown(node: TipTapNode | undefined): string {
  if (node === undefined) {
    return '';
  }
  if (node.type === 'doc') {
    return (node.content ?? []).map(renderTipTapMarkdown).filter(Boolean).join('\n\n');
  }
  if (node.type === 'paragraph') {
    return renderInlineChildren(node);
  }
  if (node.type === 'heading') {
    const level = typeof node.attrs?.level === 'number' ? node.attrs.level : 2;
    return `${'#'.repeat(Math.max(1, Math.min(level, 6)))} ${renderInlineChildren(node)}`;
  }
  if (node.type === 'bulletList') {
    return (node.content ?? []).map((child) => `- ${renderTipTapMarkdown(child)}`).join('\n');
  }
  if (node.type === 'orderedList') {
    const start = typeof node.attrs?.start === 'number' ? node.attrs.start : 1;
    return (node.content ?? []).map((child, index) => `${start + index}. ${renderTipTapMarkdown(child)}`).join('\n');
  }
  if (node.type === 'listItem') {
    return (node.content ?? []).map(renderTipTapMarkdown).filter(Boolean).join('\n');
  }
  if (node.type === 'blockquote') {
    return renderChildren(node)
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n');
  }
  if (node.type === 'codeBlock') {
    const language = typeof node.attrs?.language === 'string' ? node.attrs.language : '';
    return `\`\`\`${language}\n${renderInlineChildren(node)}\n\`\`\``;
  }
  if (node.type === 'horizontalRule') {
    return '---';
  }
  if (node.type === 'todoItem') {
    const status = node.attrs?.status === 'completed' ? 'x' : ' ';
    return `- [${status}] ${renderInlineChildren(node)}`;
  }
  if (node.type === 'hardBreak') {
    return '\n';
  }
  if (node.type === 'text') {
    return node.text ?? '';
  }
  if (node.type === 'documentMention') {
    const name = typeof node.attrs?.name === 'string' ? node.attrs.name : 'document';
    return `@${name}`;
  }
  if (node.type === 'boardMention') {
    const name = typeof node.attrs?.name === 'string' ? node.attrs.name : 'board';
    return `#${name}`;
  }
  return renderChildren(node);
}

function renderChildren(node: TipTapNode): string {
  return (node.content ?? []).map(renderTipTapMarkdown).filter(Boolean).join('\n\n');
}

function renderInlineChildren(node: TipTapNode): string {
  return (node.content ?? []).map(renderTipTapMarkdown).join('');
}
