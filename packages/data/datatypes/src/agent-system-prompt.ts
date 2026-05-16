import { createEmptyTipTapDocument, type TipTapDocument, type TipTapNode } from './document-content';

/**
 * Parses an agent registry's stored system prompt. Storage is canonical
 * TipTap JSON; rows that pre-date the JSON migration come back as a
 * markdown string and are wrapped into a flat TipTap doc so callers see
 * a uniform `TipTapDocument` shape regardless of when the row was
 * written. Returns an empty doc when the input is blank.
 */
export function parseAgentSystemPrompt(raw: string): TipTapDocument {
  if (raw.length === 0) {
    return createEmptyTipTapDocument();
  }
  if (raw.startsWith('{')) {
    try {
      const parsed = JSON.parse(raw) as TipTapDocument;
      if (parsed.type === 'doc') {
        return parsed;
      }
    } catch {
      // Fall through to plain-text wrap.
    }
  }
  return agentSystemPromptFromText(raw);
}

/**
 * Serializes a system prompt for storage. Pair with `parseAgentSystemPrompt`.
 */
export function serializeAgentSystemPrompt(doc: TipTapDocument): string {
  return JSON.stringify(doc);
}

/**
 * Wraps a plain text body in a flat TipTap document. Each blank-line
 * delimited block becomes its own paragraph; a single trailing newline
 * is dropped.
 */
export function agentSystemPromptFromText(text: string): TipTapDocument {
  if (text.length === 0) {
    return createEmptyTipTapDocument();
  }
  const paragraphs = text.split(/\n{2,}/);
  const content: TipTapNode[] = [];
  for (const block of paragraphs) {
    const trimmed = block.replace(/\n+$/, '');
    if (trimmed.length === 0) {
      content.push({ type: 'paragraph' });
      continue;
    }
    content.push({ type: 'paragraph', content: [{ type: 'text', text: trimmed }] });
  }
  return { type: 'doc', content };
}

/**
 * Renders a TipTap system prompt down to the plain-text string that the
 * LLM ultimately sees. Document mention pills surface as `@name` so the
 * model can reference the document by its human label; document content
 * is supplied separately via `documentReference` cells.
 */
export function renderAgentSystemPromptToText(doc: TipTapDocument): string {
  let out = '';
  const visit = (node: TipTapNode | undefined): void => {
    if (node === undefined) {
      return;
    }
    if (node.type === 'doc') {
      for (const child of node.content ?? []) {
        visit(child);
      }
      return;
    }
    if (node.type === 'paragraph') {
      for (const child of node.content ?? []) {
        visit(child);
      }
      out += '\n\n';
      return;
    }
    if (node.type === 'text') {
      out += node.text ?? '';
      return;
    }
    if (node.type === 'hardBreak') {
      out += '\n';
      return;
    }
    if (node.type === 'documentMention') {
      const name = typeof node.attrs?.name === 'string' ? node.attrs.name : 'document';
      out += `@${name}`;
      return;
    }
    for (const child of node.content ?? []) {
      visit(child);
    }
  };
  visit(doc as TipTapNode);
  return out.replace(/\n+$/, '').trim();
}

/**
 * Default empty system prompt body. Use whenever a registry has no
 * prompt configured — the runtime treats an empty rendered string as
 * "no system prompt".
 */
export function emptyAgentSystemPrompt(): TipTapDocument {
  return createEmptyTipTapDocument();
}
