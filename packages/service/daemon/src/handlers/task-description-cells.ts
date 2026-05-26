import type { TipTapDocument, TipTapNode } from '@two-pebble/datatypes';
import { Cell, type CellContent } from '@two-pebble/pebble';

export function taskDescriptionToCells(input: {
  description: string;
  descriptionContent: string | null;
}): CellContent[] {
  const doc = parseTipTapDocument(input.descriptionContent);
  if (doc === null) {
    const trimmed = input.description.trim();
    return trimmed.length > 0 ? [Cell.text(trimmed)] : [];
  }
  const cells = tipTapDocToCells(doc);
  if (cells.length > 0) {
    return cells;
  }
  const trimmed = input.description.trim();
  return trimmed.length > 0 ? [Cell.text(trimmed)] : [];
}

function parseTipTapDocument(content: string | null): TipTapDocument | null {
  if (content === null || content.length === 0) {
    return null;
  }
  try {
    const parsed = JSON.parse(content) as TipTapDocument;
    return parsed.type === 'doc' ? parsed : null;
  } catch {
    return null;
  }
}

function tipTapDocToCells(doc: TipTapDocument): CellContent[] {
  const cells: CellContent[] = [];
  let textBuffer = '';

  const flushText = () => {
    const trimmed = textBuffer.replace(/\n+$/, '');
    if (trimmed.length > 0) {
      cells.push(Cell.text(trimmed));
    }
    textBuffer = '';
  };

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
      textBuffer += '\n\n';
      return;
    }
    if (node.type === 'text') {
      textBuffer += node.text ?? '';
      return;
    }
    if (node.type === 'hardBreak') {
      textBuffer += '\n';
      return;
    }
    if (node.type === 'codeBlock') {
      flushText();
      const language = typeof node.attrs?.language === 'string' ? node.attrs.language : '';
      const code = (node.content ?? []).map((child) => child.text ?? '').join('');
      cells.push(Cell.codeBlock(language, code));
      return;
    }
    if (node.type === 'documentMention') {
      flushText();
      const documentId = typeof node.attrs?.documentId === 'string' ? node.attrs.documentId : '';
      const name = typeof node.attrs?.name === 'string' ? node.attrs.name : '';
      if (documentId.length > 0) {
        cells.push(Cell.documentReference({ documentId, name, contentSnapshot: '', documentUpdatedAt: 0 }));
      }
      return;
    }
    if (node.type === 'boardMention') {
      flushText();
      const boardId = typeof node.attrs?.boardId === 'string' ? node.attrs.boardId : '';
      const name = typeof node.attrs?.name === 'string' ? node.attrs.name : '';
      if (boardId.length > 0) {
        cells.push(Cell.boardReference({ boardId, name }));
      }
      return;
    }
    if (node.type === 'taskMention') {
      const taskId = typeof node.attrs?.taskId === 'string' ? node.attrs.taskId : '';
      const name = typeof node.attrs?.name === 'string' ? node.attrs.name : '';
      textBuffer += `[task: ${name || taskId}${taskId.length > 0 ? ` (id: ${taskId})` : ''}]`;
      return;
    }
    for (const child of node.content ?? []) {
      visit(child);
    }
  };

  visit(doc);
  flushText();
  return cells;
}
