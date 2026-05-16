import { defaultMarkdownParser, defaultMarkdownSerializer, schema as markdownSchema } from 'prosemirror-markdown';
import { Node as ProseMirrorNode } from 'prosemirror-model';

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
  return { type: 'doc', content: [] };
}

/**
 * Converts markdown into the TipTap JSON naming conventions used by the UI.
 * ProseMirror's default markdown parser owns parsing, then node and mark
 * names are normalized to TipTap-style identifiers.
 */
export function markdownToTipTap(markdown: string): TipTapDocument {
  const doc = defaultMarkdownParser.parse(markdown);
  return prosemirrorJsonToTipTap(doc.toJSON()) as TipTapDocument;
}

/**
 * Converts a TipTap JSON document back to markdown.
 * The document is first normalized to ProseMirror node and mark names so the
 * default markdown serializer can render it consistently.
 */
export function tipTapToMarkdown(doc: TipTapDocument): string {
  const prosemirrorJson = tipTapJsonToProsemirror(doc);
  const node = ProseMirrorNode.fromJSON(markdownSchema, prosemirrorJson);
  return defaultMarkdownSerializer.serialize(node);
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
  if (type === 'ordered_list' && typeof attrs.start === 'number') {
    const { start: _start, ...rest } = attrs;
    return { ...rest, order: attrs.start };
  }
  return attrs;
}
