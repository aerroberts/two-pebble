import type { Datastore } from '@two-pebble/datastore';
import {
  extractTipTapReferences,
  renderAgentSystemPromptToText,
  type TipTapDocument,
  type TipTapNode,
  type TipTapReference,
  tipTapToMarkdown,
} from '@two-pebble/datatypes';
import { logger } from '@two-pebble/logger';
import {
  renderAgentNamingInstruction,
  renderMemoryReferenceText,
  renderPebbleAgentNamingInstruction,
  renderSkillReferenceText,
} from '@two-pebble/pebble';
import { listSkillFolder } from '../../skills/skill-folder';
import { gatherMemoryNavigation } from '../../utils/memories/gather-memory-navigation';

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

  // Breadth-first walk over document references. Each referenced document is
  // expanded inline as a markdown block, and the skill/memory/board/task
  // mentions found inside it (and inside the prompt itself) are collected so
  // they can be serialized as rich resource descriptors and pull in their
  // usage instructions. The visited set keeps cyclic document↔document
  // references from looping forever.
  const documentBlocks: string[] = [];
  const resourceRefs = new Map<string, TipTapReference>();
  const visitedDocuments = new Set<string>();
  const documentQueue: TipTapReference[] = [];

  const enqueueReferences = (references: TipTapReference[]): void => {
    for (const reference of references) {
      if (reference.kind === 'document') {
        if (!visitedDocuments.has(reference.id)) {
          documentQueue.push(reference);
        }
        continue;
      }
      const key = `${reference.kind}:${reference.id}`;
      if (!resourceRefs.has(key)) {
        resourceRefs.set(key, reference);
      }
    }
  };

  enqueueReferences(extractTipTapReferences(input.systemPrompt));

  while (documentQueue.length > 0) {
    const reference = documentQueue.shift();
    if (reference === undefined || visitedDocuments.has(reference.id)) {
      continue;
    }
    visitedDocuments.add(reference.id);
    try {
      const row = await input.datastore.documents.read({ id: reference.id });
      documentBlocks.push(renderDocumentBlock({ content: row.content, documentId: row.id, name: row.name }));
      const parsed = parseTipTapDocument(row.content);
      if (parsed !== undefined) {
        enqueueReferences(extractTipTapReferences(parsed));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn('agent registry system prompt document reference failed', {
        documentId: reference.id,
        error: message,
      });
      documentBlocks.push(`[document ${reference.name} (id: ${reference.id}) is unavailable]`);
    }
  }

  const resources = await renderReferencedResources(input.datastore, [...resourceRefs.values()]);
  return [base, ...documentBlocks, resources].filter((part) => part.trim().length > 0).join('\n\n');
}

const SKILL_USAGE =
  '## Skills\n' +
  'The referenced skills are folders of instructions and scripts on disk. Before relying on a ' +
  'skill, read its files from the absolute folder path shown below with your file tools, and run ' +
  'any scripts it defines from that folder.';

const MEMORY_USAGE =
  '## Memory collections\n' +
  'The referenced memory collections are folders of markdown notes on disk. Each block lists the ' +
  'absolute folder path, the curated `index.md`, and a file tree — read individual files from that ' +
  'folder before acting on them. (Pebble agents may also use the `memory-*` tools keyed by the `memoryId`.)';

const BOARD_USAGE =
  '## Task boards\n' +
  'The referenced task boards track work items. Use the board id below when reading or updating their tasks.';

const TASK_USAGE =
  '## Tasks\n' + 'The referenced tasks are individual work items. Use the task id below when reading or updating them.';

/**
 * Resolves every non-document reference against durable storage and renders
 * a `# Referenced resources` section: a usage instruction per resource kind
 * plus a rich descriptor (name, id, absolute on-disk path, description, file
 * tree) for each individual reference. Returns an empty string when nothing
 * resolved so callers can drop the section entirely.
 */
async function renderReferencedResources(datastore: Datastore, references: TipTapReference[]): Promise<string> {
  if (references.length === 0) {
    return '';
  }
  const skills: string[] = [];
  const memories: string[] = [];
  const boards: string[] = [];
  const tasks: string[] = [];
  for (const reference of references) {
    if (reference.kind === 'skill') {
      skills.push(await renderSkillResource(datastore, reference));
    } else if (reference.kind === 'memory') {
      memories.push(await renderMemoryResource(datastore, reference));
    } else if (reference.kind === 'board') {
      boards.push(await renderBoardResource(datastore, reference));
    } else if (reference.kind === 'task') {
      tasks.push(`[task: ${reference.name} (id: ${reference.id})]`);
    }
  }
  const sections: string[] = [];
  if (skills.length > 0) {
    sections.push([SKILL_USAGE, ...skills].join('\n\n'));
  }
  if (memories.length > 0) {
    sections.push([MEMORY_USAGE, ...memories].join('\n\n'));
  }
  if (boards.length > 0) {
    sections.push([BOARD_USAGE, ...boards].join('\n\n'));
  }
  if (tasks.length > 0) {
    sections.push([TASK_USAGE, ...tasks].join('\n\n'));
  }
  if (sections.length === 0) {
    return '';
  }
  return [
    '# Referenced resources',
    'Your instructions reference the resources below. Treat each as authoritative context.',
    ...sections,
  ].join('\n\n');
}

async function renderSkillResource(datastore: Datastore, reference: TipTapReference): Promise<string> {
  try {
    const row = await datastore.skills.read({ id: reference.id });
    const files = safeListSkillFolder(row.diskFolderPath, row.id);
    return renderSkillReferenceText({
      skillId: row.id,
      name: row.name,
      description: row.description,
      diskFolderPath: row.diskFolderPath,
      files,
    });
  } catch (error) {
    logger.warn('agent registry system prompt skill reference failed', {
      skillId: reference.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return `[skill: ${reference.name} (id: ${reference.id})] unavailable`;
  }
}

async function renderMemoryResource(datastore: Datastore, reference: TipTapReference): Promise<string> {
  try {
    const row = await datastore.memories.read({ id: reference.id });
    const navigation = await gatherMemoryNavigation(row.path);
    const body = renderMemoryReferenceText({
      memoryId: row.id,
      name: row.name,
      unavailable: navigation.unavailable,
      files: navigation.files,
      ...(navigation.index === undefined ? {} : { index: navigation.index }),
    });
    return `Absolute folder: ${row.path}\n${body}`;
  } catch (error) {
    logger.warn('agent registry system prompt memory reference failed', {
      memoryId: reference.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return `[memory: ${reference.name} (id: ${reference.id})] unavailable`;
  }
}

async function renderBoardResource(datastore: Datastore, reference: TipTapReference): Promise<string> {
  try {
    const row = await datastore.taskBoards.read({ id: reference.id });
    return `[board: ${row.name} (id: ${row.id})]`;
  } catch (error) {
    logger.warn('agent registry system prompt board reference failed', {
      boardId: reference.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return `[board: ${reference.name} (id: ${reference.id})] unavailable`;
  }
}

function safeListSkillFolder(diskFolderPath: string, skillId: string): string[] {
  try {
    return listSkillFolder(diskFolderPath);
  } catch (error) {
    logger.warn('agent registry system prompt skill folder listing failed', {
      skillId,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

function parseTipTapDocument(content: string): TipTapDocument | undefined {
  try {
    const parsed = JSON.parse(content) as TipTapDocument;
    return parsed.type === 'doc' ? parsed : undefined;
  } catch {
    return undefined;
  }
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
