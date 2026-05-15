import type { CellContent, DataCells } from '../../../../thread/cells';

/**
 * Renders a CellContent as a plain string the Claude Code SDK can consume.
 * Different cell variants store their data under different `content.*` keys,
 * so a generic `cell.content` join would yield `[object Object]`.
 */
export function cellToString(cell: CellContent): string {
  switch (cell.type) {
    case 'text':
    case 'header1':
    case 'header2':
      return cell.content.text;
    case 'codeBlock':
      return cell.content.code;
    case 'data':
      return JSON.stringify(cell.content.value);
    case 'documentReference':
      return `[document: ${cell.content.name} (id: ${cell.content.documentId})]\n${cell.content.contentSnapshot}`;
    case 'image':
      return '';
    case 'audio':
      return cell.content.transcript ?? '';
    case 'toolRegistration':
      return '';
    case 'toolUse':
      return `[tool call: ${cell.content.toolId} ${JSON.stringify(cell.content.input)}]`;
    case 'toolResult':
      return (cell.content.content as DataCells).map((inner) => cellToString(inner)).join('\n\n');
  }
}
