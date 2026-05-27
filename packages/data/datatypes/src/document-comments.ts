import type { TipTapAttrs, TipTapDocument, TipTapJsonValue, TipTapNode } from './document-content';

export type CommentThreadStatus = 'open' | 'closed';

export interface CommentThread {
  cellId: string;
  status: CommentThreadStatus;
  closedReason?: string;
  closedBy?: string;
  closedAt?: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  authorId: string;
  body: string;
  createdAt: number;
}

export interface ApplyCommentAddInput {
  cellId: string;
  body: string;
  authorId: string;
  now?: number;
  commentId?: string;
}

export interface ApplyCommentCloseInput {
  cellId: string;
  closedReason: string;
  authorId: string;
  now?: number;
}

export const COMMENT_SECTION_NODE_TYPE = 'commentSection';
export const COMMENT_CELL_NODE_TYPES = new Set([
  'paragraph',
  'heading',
  'codeBlock',
  'todoItem',
  'blockquote',
  'bulletList',
  'orderedList',
]);

const CELL_ID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function generateCellId(): string {
  const time = Date.now();
  const timeBytes: string[] = [];
  let remaining = time;
  for (let i = 0; i < 10; i++) {
    timeBytes.unshift(readCellIdCharacter(remaining % 32));
    remaining = Math.floor(remaining / 32);
  }
  let random = '';
  for (let i = 0; i < 16; i++) {
    random += readCellIdCharacter(Math.floor(Math.random() * 32));
  }
  return timeBytes.join('') + random;
}

export function extractComments(doc: TipTapDocument | null | undefined): CommentThread[] {
  if (doc === null || doc === undefined) {
    return [];
  }
  return extractCommentSections(doc).flatMap((node) => readThreadList(node.attrs?.threads));
}

export function applyCommentAdd(doc: TipTapDocument, input: ApplyCommentAddInput): TipTapDocument {
  const cellId = input.cellId.trim();
  const body = input.body.trim();
  const authorId = input.authorId.trim();
  if (cellId.length === 0) {
    throw new Error('Comment cellId is required.');
  }
  if (body.length === 0) {
    throw new Error('Comment body is required.');
  }
  if (authorId.length === 0) {
    throw new Error('Comment authorId is required.');
  }
  const now = input.now ?? Date.now();
  const threads = extractComments(doc);
  const existingIndex = threads.findIndex((thread) => thread.cellId === cellId);
  const comment: Comment = {
    id: input.commentId ?? generateCellId(),
    authorId,
    body,
    createdAt: now,
  };

  if (existingIndex === -1) {
    return writeCommentThreads(doc, [
      ...threads,
      {
        cellId,
        status: 'open',
        comments: [comment],
      },
    ]);
  }

  const nextThreads = threads.map((thread, index) => {
    if (index !== existingIndex) {
      return thread;
    }
    return {
      cellId: thread.cellId,
      status: 'open' as const,
      comments: [...thread.comments, comment],
    };
  });
  return writeCommentThreads(doc, nextThreads);
}

export function applyCommentClose(doc: TipTapDocument, input: ApplyCommentCloseInput): TipTapDocument {
  const cellId = input.cellId.trim();
  const closedReason = input.closedReason.trim();
  const authorId = input.authorId.trim();
  if (cellId.length === 0) {
    throw new Error('Comment cellId is required.');
  }
  if (closedReason.length === 0) {
    throw new Error('Closed comments require a reason.');
  }
  if (authorId.length === 0) {
    throw new Error('Comment authorId is required.');
  }
  const threads = extractComments(doc);
  let found = false;
  const nextThreads = threads.map((thread) => {
    if (thread.cellId !== cellId) {
      return thread;
    }
    found = true;
    return {
      ...thread,
      status: 'closed' as const,
      closedReason,
      closedBy: authorId,
      closedAt: input.now ?? Date.now(),
    };
  });
  if (!found) {
    return doc;
  }
  return writeCommentThreads(doc, nextThreads);
}

export function validateCommentThread(thread: unknown): CommentThread {
  if (!isRecord(thread)) {
    throw new Error('Comment thread must be an object.');
  }
  const cellId = readRequiredString(thread.cellId, 'Comment thread cellId');
  const status = thread.status;
  if (status !== 'open' && status !== 'closed') {
    throw new Error(`Comment thread ${cellId} has invalid status.`);
  }
  if (!Array.isArray(thread.comments)) {
    throw new Error(`Comment thread ${cellId} comments must be an array.`);
  }
  const comments = thread.comments.map((comment) => validateComment(comment, cellId));
  const next: CommentThread = { cellId, status, comments };
  if (status === 'closed') {
    next.closedReason = readRequiredString(thread.closedReason, `Comment thread ${cellId} closedReason`);
  }
  if (typeof thread.closedBy === 'string' && thread.closedBy.trim().length > 0) {
    next.closedBy = thread.closedBy;
  }
  if (typeof thread.closedAt === 'number' && Number.isFinite(thread.closedAt)) {
    next.closedAt = thread.closedAt;
  }
  return next;
}

export function normalizeDocumentComments(doc: TipTapDocument): TipTapDocument {
  const seenCellIds = new Set<string>();
  const seenThreads = new Set<string>();
  const threads: CommentThread[] = [];
  const content = (doc.content ?? [])
    .filter((node) => {
      if (node.type !== COMMENT_SECTION_NODE_TYPE) {
        return true;
      }
      for (const thread of readThreadList(node.attrs?.threads)) {
        if (!seenThreads.has(thread.cellId)) {
          seenThreads.add(thread.cellId);
          threads.push(thread);
        }
      }
      return false;
    })
    .map((node) => normalizeCellNode(node, seenCellIds));

  return {
    ...doc,
    content: [...content, createCommentSection(threads)],
  };
}

export function validateDocumentComments(doc: TipTapDocument): void {
  const content = doc.content ?? [];
  let commentSectionCount = 0;
  const seenCellIds = new Set<string>();
  content.forEach((node, index) => {
    if (node.type === COMMENT_SECTION_NODE_TYPE) {
      commentSectionCount += 1;
      if (index !== content.length - 1) {
        throw new Error('commentSection must be the last document node.');
      }
      const threads = node.attrs?.threads;
      if (!Array.isArray(threads)) {
        throw new Error('commentSection threads must be an array.');
      }
      for (const thread of threads) {
        validateCommentThread(thread);
      }
      return;
    }
    validateCellIds(node, seenCellIds);
  });
  if (commentSectionCount !== 1) {
    throw new Error('Document must contain exactly one trailing commentSection.');
  }
}

export function renderCommentsMarkdown(doc: TipTapDocument): string {
  const threads = extractComments(doc);
  if (threads.length === 0) {
    return '';
  }
  const cellTextById = collectCellTextById(doc);
  const active: string[] = [];
  const orphaned: string[] = [];
  for (const thread of threads) {
    const cellText = cellTextById.get(thread.cellId);
    const rendered = renderThreadMarkdown(thread, cellText ?? '(deleted)');
    if (cellText === undefined) {
      orphaned.push(rendered);
    } else {
      active.push(rendered);
    }
  }
  const sections = ['## Comments'];
  sections.push(...active);
  if (orphaned.length > 0) {
    sections.push('### Orphaned', ...orphaned);
  }
  return sections.filter(Boolean).join('\n\n');
}

export function stripCommentSection(doc: TipTapDocument): TipTapDocument {
  return { ...doc, content: (doc.content ?? []).filter((node) => node.type !== COMMENT_SECTION_NODE_TYPE) };
}

export function collectCellTextById(doc: TipTapDocument): Map<string, string> {
  const result = new Map<string, string>();
  walkNode(doc, (node) => {
    if (!COMMENT_CELL_NODE_TYPES.has(node.type)) {
      return;
    }
    const cellId = typeof node.attrs?.cellId === 'string' ? node.attrs.cellId : '';
    if (cellId.length > 0) {
      result.set(cellId, collectText(node).trim());
    }
  });
  return result;
}

function validateComment(comment: unknown, cellId: string): Comment {
  if (!isRecord(comment)) {
    throw new Error(`Comment in thread ${cellId} must be an object.`);
  }
  const id = readRequiredString(comment.id, `Comment in thread ${cellId} id`);
  const authorId = readRequiredString(comment.authorId, `Comment ${id} authorId`);
  const body = readRequiredString(comment.body, `Comment ${id} body`);
  if (typeof comment.createdAt !== 'number' || !Number.isFinite(comment.createdAt)) {
    throw new Error(`Comment ${id} createdAt must be a number.`);
  }
  return { id, authorId, body, createdAt: comment.createdAt };
}

function validateCellIds(node: TipTapNode, seenCellIds: Set<string>): void {
  if (COMMENT_CELL_NODE_TYPES.has(node.type)) {
    const cellId = typeof node.attrs?.cellId === 'string' ? node.attrs.cellId : '';
    if (cellId.trim().length === 0) {
      throw new Error(`${node.type} is missing cellId.`);
    }
    if (seenCellIds.has(cellId)) {
      throw new Error(`Duplicate cellId: ${cellId}.`);
    }
    seenCellIds.add(cellId);
  }
  for (const child of node.content ?? []) {
    validateCellIds(child, seenCellIds);
  }
}

function writeCommentThreads(doc: TipTapDocument, threads: CommentThread[]): TipTapDocument {
  const content = (doc.content ?? []).filter((node) => node.type !== COMMENT_SECTION_NODE_TYPE);
  return {
    ...doc,
    content: [...content, createCommentSection(threads)],
  };
}

function createCommentSection(threads: CommentThread[]): TipTapNode {
  return {
    type: COMMENT_SECTION_NODE_TYPE,
    attrs: {
      threads: threads as unknown as TipTapJsonValue,
    },
  };
}

function extractCommentSections(doc: TipTapDocument): TipTapNode[] {
  return (doc.content ?? []).filter((node) => node.type === COMMENT_SECTION_NODE_TYPE);
}

function readThreadList(value: unknown): CommentThread[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const threads: CommentThread[] = [];
  for (const item of value) {
    try {
      threads.push(validateCommentThread(item));
    } catch {}
  }
  return threads;
}

function normalizeCellNode(node: TipTapNode, seenCellIds: Set<string>): TipTapNode {
  const content = node.content?.map((child) => normalizeCellNode(child, seenCellIds));
  if (!COMMENT_CELL_NODE_TYPES.has(node.type)) {
    return content === undefined ? node : { ...node, content };
  }
  const rawCellId = typeof node.attrs?.cellId === 'string' ? node.attrs.cellId : '';
  const cellId = rawCellId.length === 0 || seenCellIds.has(rawCellId) ? generateCellId() : rawCellId;
  seenCellIds.add(cellId);
  const attrs: TipTapAttrs = { ...(node.attrs ?? {}), cellId };
  return {
    ...node,
    attrs,
    ...(content === undefined ? {} : { content }),
  };
}

function renderThreadMarkdown(thread: CommentThread, cellText: string): string {
  const quoted = cellText
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
  const comments = thread.comments.map((comment) => {
    const status = thread.status === 'closed' ? `closed: ${thread.closedReason ?? 'no reason'}` : thread.status;
    return `- ${comment.authorId} (${status}): ${comment.body}`;
  });
  return [quoted, ...comments].join('\n');
}

function walkNode(node: TipTapNode, visit: (node: TipTapNode) => void): void {
  visit(node);
  for (const child of node.content ?? []) {
    walkNode(child, visit);
  }
}

function collectText(node: TipTapNode): string {
  if (typeof node.text === 'string') {
    return node.text;
  }
  return (node.content ?? []).map(collectText).join('');
}

function readRequiredString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${label} is required.`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readCellIdCharacter(index: number): string {
  return CELL_ID_ALPHABET[index] ?? '0';
}
