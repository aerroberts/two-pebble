import type { CellContent } from '../../../thread/cells/index';
import { renderBoardReferenceText } from '../shared/render-board-reference';
import { renderDocumentReferenceText } from '../shared/render-document-reference';
import { renderMemoryReferenceText } from '../shared/render-memory-reference';

export function renderTextCellOllama(cell: CellContent): string {
  switch (cell.type) {
    case 'boardReference':
      return renderBoardReferenceText(cell.content);
    case 'codeBlock':
      return `\`\`\`${cell.content.language}\n${cell.content.code}\n\`\`\``;
    case 'data':
      return `\`\`\`json\n${JSON.stringify(cell.content.value, null, 2)}\n\`\`\``;
    case 'documentReference':
      return renderDocumentReferenceText(cell.content);
    case 'memoryReference':
      return renderMemoryReferenceText(cell.content);
    case 'header1':
      return `# ${cell.content.text}`;
    case 'header2':
      return `## ${cell.content.text}`;
    case 'text':
      return cell.content.text;
    case 'audio':
      return cell.content.transcript == null || cell.content.transcript.length === 0
        ? '[audio]'
        : `[audio: ${cell.content.transcript}]`;
    case 'image':
      return `[image](data:image/*;base64,${cell.content.base64Data})`;
    case 'toolRegistration':
    case 'toolUse':
    case 'toolResult':
      return '';
  }
}
