import type { JSONContent } from '@tiptap/core';

/**
 * Derives a markdown/text rendering from a composer document. Document
 * pills serialize to `@name` so logs and voice transcripts stay readable
 * even when the structured `cells` field is consumed downstream.
 */
export function tipTapDocToMarkdown(doc: JSONContent): string {
  let out = '';
  const visit = (node: JSONContent | undefined): void => {
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
    if (node.type === 'codeBlock') {
      const language = typeof node.attrs?.language === 'string' ? node.attrs.language : '';
      const code = (node.content ?? []).map((child) => child.text ?? '').join('');
      out += `\n\`\`\`${language}\n${code}\n\`\`\`\n`;
      return;
    }
    if (node.type === 'documentMention') {
      const name = typeof node.attrs?.name === 'string' ? node.attrs.name : 'document';
      out += `@${name}`;
      return;
    }
    if (node.type === 'boardMention') {
      const name = typeof node.attrs?.name === 'string' ? node.attrs.name : 'board';
      out += `#${name}`;
      return;
    }
    if (node.type === 'taskMention') {
      const name = typeof node.attrs?.name === 'string' ? node.attrs.name : 'task';
      out += `!${name}`;
      return;
    }
    if (node.type === 'skillMention') {
      const name = typeof node.attrs?.name === 'string' ? node.attrs.name : 'skill';
      out += `*${name}`;
      return;
    }
    if (node.type === 'memoryMention') {
      const name = typeof node.attrs?.name === 'string' ? node.attrs.name : 'memory';
      out += `@${name}`;
      return;
    }
    for (const child of node.content ?? []) {
      visit(child);
    }
  };
  visit(doc);
  return out.replace(/\n+$/, '').trim();
}
