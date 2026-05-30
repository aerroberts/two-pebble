import { defaultMarkdownParser, defaultMarkdownSerializer, schema as markdownSchema } from 'prosemirror-markdown';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import {
  normalizeDocumentComments,
  renderCommentsMarkdown,
  stripCommentSection,
  validateDocumentComments,
} from './document-comments';

/**
 * TipTap-compatible JSON node used for document content persistence.
 * The shape intentionally stays generic so extension-specific node attrs can
 * round-trip through storage without the datatypes package knowing each node.
 */
export interface TipTapNode {
  type: string;
  attrs?: TipTapAttrs;
  content?: TipTapNode[];
  marks?: TipTapMark[];
  text?: string;
}

/**
 * TipTap-compatible mark payload attached to text nodes.
 * Marks share the same loose attrs representation as nodes so formatting
 * extensions can preserve their data through markdown conversions.
 */
export interface TipTapMark {
  type: string;
  attrs?: TipTapAttrs;
}

/**
 * Root TipTap document node stored for rich-text fields.
 * Consumers can rely on the `doc` root while still accepting documents with
 * no content array as an empty body.
 */
export interface TipTapDocument {
  type: 'doc';
  content?: TipTapNode[];
}

/**
 * JSON object attrs attached to TipTap nodes and marks.
 * Values stay recursive to match the editor JSON contract while keeping
 * primitives and nested arrays type-safe.
 */
export type TipTapAttrs = {
  [key: string]: TipTapJsonValue;
};

/**
 * Recursive JSON value accepted inside TipTap attrs.
 * This excludes functions and undefined so attrs can be persisted directly as
 * JSON without lossy cleanup.
 */
export type TipTapJsonValue = string | number | boolean | null | TipTapJsonValue[] | TipTapAttrs;

const PROSEMIRROR_TO_TIPTAP_NODE_NAMES: Record<string, string> = {
  bullet_list: 'bulletList',
  code_block: 'codeBlock',
  hard_break: 'hardBreak',
  horizontal_rule: 'horizontalRule',
  list_item: 'listItem',
  ordered_list: 'orderedList',
};

const TIPTAP_TO_PROSEMIRROR_NODE_NAMES = Object.fromEntries(
  Object.entries(PROSEMIRROR_TO_TIPTAP_NODE_NAMES).map(([key, value]) => [value, key]),
) as Record<string, string>;

const PROSEMIRROR_TO_TIPTAP_MARK_NAMES: Record<string, string> = {
  em: 'italic',
  strong: 'bold',
};

const TIPTAP_TO_PROSEMIRROR_MARK_NAMES = Object.fromEntries(
  Object.entries(PROSEMIRROR_TO_TIPTAP_MARK_NAMES).map(([key, value]) => [value, key]),
) as Record<string, string>;

/**
 * Creates the canonical empty TipTap document used by editable rich-text
 * fields. Returning a content array avoids callers needing to special-case
 * an absent body when appending nodes.
 */
export function createEmptyTipTapDocument(): TipTapDocument {
  return normalizeDocumentComments({ type: 'doc', content: [] });
}

/**
 * Converts markdown into the TipTap JSON naming conventions used by the UI.
 * ProseMirror's default markdown parser owns parsing of common nodes; GFM
 * pipe tables are pre-extracted and converted directly to TipTap table JSON
 * (`table` / `tableRow` / `tableHeader` / `tableCell`) since the default
 * parser drops them to plain text.
 */
export function markdownToTipTap(markdown: string): TipTapDocument {
  const segments = splitTableSegments(markdown);
  const content: TipTapNode[] = [];
  for (const segment of segments) {
    if (segment.type === 'table') {
      content.push(tableSegmentToTipTap(segment.value));
      continue;
    }
    if (segment.value.length === 0) {
      continue;
    }
    const parsed = defaultMarkdownParser.parse(segment.value);
    const json = prosemirrorJsonToTipTap(parsed.toJSON()) as TipTapDocument;
    if (json.content !== undefined) {
      content.push(...json.content);
    }
  }
  return normalizeDocumentComments({ type: 'doc', content });
}

/**
 * Converts a TipTap JSON document back to markdown.
 * Table nodes are serialized inline as GFM pipe tables (the default markdown
 * schema has no table support); the rest of the document is handed to the
 * default markdown serializer.
 */
export function tipTapToMarkdown(doc: TipTapDocument): string {
  const content = stripCommentSection(doc).content ?? [];
  const chunks: string[] = [];
  let pending: TipTapNode[] = [];

  const flushPending = () => {
    if (pending.length === 0) {
      return;
    }
    const pmDoc = tipTapJsonToProsemirror({ type: 'doc', content: pending });
    const node = ProseMirrorNode.fromJSON(markdownSchema, pmDoc);
    chunks.push(defaultMarkdownSerializer.serialize(node));
    pending = [];
  };

  for (const node of content) {
    if (node.type === 'table') {
      flushPending();
      chunks.push(tableNodeToMarkdown(node));
      continue;
    }
    pending.push(node);
  }
  flushPending();
  const comments = renderCommentsMarkdown(doc);
  return [chunks.join('\n\n'), comments].filter((section) => section.trim().length > 0).join('\n\n');
}

export function validateDocumentContent(content: string): TipTapDocument {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Document content must be valid JSON.');
  }
  if (!isTipTapNode(parsed) || parsed.type !== 'doc') {
    throw new Error('Document content must be a TipTap doc.');
  }
  const doc = parsed as TipTapDocument;
  validateDocumentComments(doc);
  return doc;
}

/** Kind of inline reference a TipTap mention node can carry. */
export type TipTapReferenceKind = 'document' | 'board' | 'memory' | 'skill' | 'task';

/**
 * A reference mention extracted from TipTap content. `id` is the durable
 * id of the referenced resource (documentId/boardId/memoryId/skillId/taskId)
 * and `name` is the human label the mention was inserted with.
 */
export interface TipTapReference {
  kind: TipTapReferenceKind;
  id: string;
  name: string;
}

const MENTION_NODE_REFERENCES: Record<string, { kind: TipTapReferenceKind; idAttr: string }> = {
  documentMention: { kind: 'document', idAttr: 'documentId' },
  boardMention: { kind: 'board', idAttr: 'boardId' },
  memoryMention: { kind: 'memory', idAttr: 'memoryId' },
  skillMention: { kind: 'skill', idAttr: 'skillId' },
  taskMention: { kind: 'task', idAttr: 'taskId' },
};

/**
 * Walks TipTap content and collects every reference mention
 * (document/board/memory/skill/task) into a flat, de-duplicated list.
 * Document order is preserved; duplicates collapse on `kind`+`id` so a body
 * that mentions the same resource twice yields one entry. Mentions with an
 * empty id are skipped — they can only land here from corrupt state.
 */
export function extractTipTapReferences(node: TipTapNode | TipTapDocument | undefined): TipTapReference[] {
  const out: TipTapReference[] = [];
  const seen = new Set<string>();
  const visit = (current: TipTapNode | undefined): void => {
    if (current === undefined) {
      return;
    }
    const mapping = MENTION_NODE_REFERENCES[current.type];
    if (mapping !== undefined) {
      const id = readStringAttr(current, mapping.idAttr, '');
      const name = readStringAttr(current, 'name', '');
      const key = `${mapping.kind}:${id}`;
      if (id.length > 0 && !seen.has(key)) {
        seen.add(key);
        out.push({ kind: mapping.kind, id, name });
      }
      return;
    }
    for (const child of current.content ?? []) {
      visit(child);
    }
  };
  visit(node as TipTapNode);
  return out;
}

function prosemirrorJsonToTipTap(node: TipTapNode): TipTapNode {
  const type = PROSEMIRROR_TO_TIPTAP_NODE_NAMES[node.type] ?? node.type;
  const attrs = convertAttrsToTipTap(type, node.attrs);

  return {
    ...node,
    type,
    ...(attrs === undefined ? {} : { attrs }),
    ...(node.content === undefined ? {} : { content: node.content.map(prosemirrorJsonToTipTap) }),
    ...(node.marks === undefined ? {} : { marks: node.marks.map(prosemirrorMarkToTipTap) }),
  };
}

function tipTapJsonToProsemirror(node: TipTapNode): TipTapNode {
  const mentionText = renderMentionNodeText(node);
  if (mentionText !== undefined) {
    return { type: 'text', text: mentionText };
  }
  const type = TIPTAP_TO_PROSEMIRROR_NODE_NAMES[node.type] ?? node.type;
  const attrs = convertAttrsToProsemirror(type, node.attrs);

  return {
    ...node,
    type,
    ...(attrs === undefined ? {} : { attrs }),
    ...(node.content === undefined ? {} : { content: node.content.map(tipTapJsonToProsemirror) }),
    ...(node.marks === undefined ? {} : { marks: node.marks.map(tipTapMarkToProsemirror) }),
  };
}

function renderMentionNodeText(node: TipTapNode): string | undefined {
  if (node.type === 'documentMention') {
    return `@${readStringAttr(node, 'name', 'document')}`;
  }
  if (node.type === 'boardMention') {
    return `#${readStringAttr(node, 'name', 'board')}`;
  }
  if (node.type === 'memoryMention') {
    return `@${readStringAttr(node, 'name', 'memory')}`;
  }
  if (node.type === 'skillMention') {
    return `*${readStringAttr(node, 'name', 'skill')}`;
  }
  if (node.type === 'taskMention') {
    return `!${readStringAttr(node, 'name', 'task')}`;
  }
  return undefined;
}

function readStringAttr(node: TipTapNode, key: string, fallback: string): string {
  const value = node.attrs?.[key];
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function prosemirrorMarkToTipTap(mark: TipTapMark): TipTapMark {
  return {
    ...mark,
    type: PROSEMIRROR_TO_TIPTAP_MARK_NAMES[mark.type] ?? mark.type,
  };
}

function tipTapMarkToProsemirror(mark: TipTapMark): TipTapMark {
  return {
    ...mark,
    type: TIPTAP_TO_PROSEMIRROR_MARK_NAMES[mark.type] ?? mark.type,
  };
}

function convertAttrsToTipTap(type: string, attrs: TipTapAttrs | undefined): TipTapAttrs | undefined {
  if (attrs === undefined) {
    return undefined;
  }
  if (type === 'codeBlock' && typeof attrs.params === 'string') {
    const { params: _params, ...rest } = attrs;
    const language = attrs.params.trim().split(/\s+/)[0] ?? '';
    return language.length === 0 ? rest : { ...rest, language };
  }
  if (type === 'orderedList' && typeof attrs.order === 'number') {
    const { order: _order, ...rest } = attrs;
    return { ...rest, start: attrs.order };
  }
  return attrs;
}

function convertAttrsToProsemirror(type: string, attrs: TipTapAttrs | undefined): TipTapAttrs | undefined {
  if (attrs === undefined) {
    return undefined;
  }
  if (type === 'code_block' && typeof attrs.language === 'string') {
    const { language: _language, ...rest } = attrs;
    return attrs.language.length === 0 ? rest : { ...rest, params: attrs.language };
  }
  if (type === 'ordered_list' && typeof attrs.start === 'number') {
    const { start: _start, ...rest } = attrs;
    return { ...rest, order: attrs.start };
  }
  return attrs;
}

function isTipTapNode(value: unknown): value is TipTapNode {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.type === 'string' && (record.content === undefined || Array.isArray(record.content));
}

interface TableSegment {
  header: string[];
  rows: string[][];
}

type MarkdownSegment = { type: 'text'; value: string } | { type: 'table'; value: TableSegment };

// `|---|:--|--:|` (with or without outer pipes). At least one column required.
const TABLE_SEPARATOR_RE = /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/;
// A row-like line starts and/or ends with a pipe and contains at least one
// internal pipe.
const TABLE_ROW_RE = /^\s*\|.*\|\s*$/;

/**
 * Splits raw markdown into ordered text segments and GFM pipe-table blocks.
 * Each table block has its header row, its body rows, and consumes the
 * separator line between them. Anything else stays as-is and is parsed by the
 * default ProseMirror markdown parser.
 */
function splitTableSegments(markdown: string): MarkdownSegment[] {
  const lines = markdown.split('\n');
  const segments: MarkdownSegment[] = [];
  let textBuffer: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const headerLine = lines[i] ?? '';
    const separatorLine = lines[i + 1] ?? '';
    if (
      i + 1 < lines.length &&
      TABLE_ROW_RE.test(headerLine) &&
      TABLE_SEPARATOR_RE.test(separatorLine) &&
      splitRowCells(headerLine).length === splitRowCells(separatorLine).length
    ) {
      if (textBuffer.length > 0) {
        segments.push({ type: 'text', value: textBuffer.join('\n') });
        textBuffer = [];
      }
      const header = splitRowCells(headerLine);
      const rows: string[][] = [];
      let j = i + 2;
      while (j < lines.length) {
        const rowLine = lines[j] ?? '';
        if (!TABLE_ROW_RE.test(rowLine)) {
          break;
        }
        const cells = splitRowCells(rowLine);
        // Pad / truncate to the header width so the table stays rectangular.
        const padded: string[] = [];
        for (let c = 0; c < header.length; c += 1) {
          padded.push(cells[c] ?? '');
        }
        rows.push(padded);
        j += 1;
      }
      segments.push({ type: 'table', value: { header, rows } });
      i = j;
      continue;
    }
    textBuffer.push(headerLine);
    i += 1;
  }
  if (textBuffer.length > 0) {
    segments.push({ type: 'text', value: textBuffer.join('\n') });
  }
  return segments;
}

function splitRowCells(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((cell) => cell.trim());
}

function tableSegmentToTipTap(segment: TableSegment): TipTapNode {
  const headerCells: TipTapNode[] = segment.header.map((text) => ({
    type: 'tableHeader',
    content: [cellParagraph(text)],
  }));
  const headerRow: TipTapNode = { type: 'tableRow', content: headerCells };

  const bodyRows: TipTapNode[] = segment.rows.map((row) => ({
    type: 'tableRow',
    content: row.map((text) => ({
      type: 'tableCell',
      content: [cellParagraph(text)],
    })),
  }));

  return { type: 'table', content: [headerRow, ...bodyRows] };
}

function tableNodeToMarkdown(table: TipTapNode): string {
  const rows = table.content ?? [];
  const firstRow = rows[0];
  if (firstRow === undefined) {
    return '';
  }
  const headerCells = (firstRow.content ?? []).map((cell) => cellNodeToText(cell));
  const headerLine = `| ${headerCells.join(' | ')} |`;
  const separatorLine = `| ${headerCells.map(() => '---').join(' | ')} |`;
  const bodyLines = rows.slice(1).map((row) => {
    const cells = (row.content ?? []).map((cell) => cellNodeToText(cell));
    while (cells.length < headerCells.length) {
      cells.push('');
    }
    return `| ${cells.join(' | ')} |`;
  });
  return [headerLine, separatorLine, ...bodyLines].join('\n');
}

function cellNodeToText(cell: TipTapNode): string {
  const paragraph = cell.content?.[0];
  const inline = paragraph?.content ?? [];
  return inline
    .map((node) => (typeof node.text === 'string' ? node.text : ''))
    .join('')
    .replace(/\|/g, '\\|');
}

function cellParagraph(text: string): TipTapNode {
  // Cells can carry inline markdown (bold, italics, code, links). Defer to the
  // default parser for a single line, then unwrap its paragraph so the cell
  // owns the inline content.
  if (text.length === 0) {
    return { type: 'paragraph' };
  }
  const parsed = defaultMarkdownParser.parse(text);
  const json = prosemirrorJsonToTipTap(parsed.toJSON()) as TipTapDocument;
  const firstBlock = json.content?.[0];
  if (firstBlock?.type === 'paragraph') {
    return firstBlock;
  }
  return { type: 'paragraph', content: [{ type: 'text', text }] };
}
