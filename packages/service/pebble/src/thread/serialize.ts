import type { CellContent } from './cells/index';
import type { ConversationThreadCells, ConversationTurn, DataCells } from './types';

export function serializeConversationCells(cells: ConversationThreadCells) {
  const turns: ConversationTurn[] = [];
  let currentTurn: ConversationTurn | undefined;

  for (const cell of cells) {
    const currentRole = currentTurn?.role;
    if (currentTurn === undefined || cell.role !== currentRole) {
      currentTurn = { role: cell.role, cells: [], raw: '' };
      turns.push(currentTurn);
    }

    currentTurn.cells.push(...cell.cells);
    currentTurn.raw += serializeTurnCells(cell.cells);
  }

  return turns;
}

function serializeTurnCells(cells: DataCells): string {
  return cells
    .map((cell) => serializeCell(cell))
    .filter((rendered) => rendered.length > 0)
    .join('\n\n');
}

function serializeCell(cell: CellContent): string {
  switch (cell.type) {
    case 'audio':
      return cell.content.transcript == null || cell.content.transcript.length === 0
        ? '[audio]'
        : `[audio: ${cell.content.transcript}]`;
    case 'boardReference':
      return `[board: ${cell.content.name} (id: ${cell.content.boardId})]`;
    case 'codeBlock':
      return `\`\`\`${cell.content.language}\n${cell.content.code}\n\`\`\``;
    case 'data':
      return `\`\`\`json\n${JSON.stringify(cell.content.value, null, 2)}\n\`\`\``;
    case 'documentReference':
      return `[document: ${cell.content.name} (id: ${cell.content.documentId})]\n\n${cell.content.contentSnapshot}`;
    case 'memoryReference':
      return `[memory: ${cell.content.name} (memoryId: ${cell.content.memoryId})]`;
    case 'header1':
      return `# ${cell.content.text}`;
    case 'header2':
      return `## ${cell.content.text}`;
    case 'image':
      return `[image](data:image/*;base64,${cell.content.base64Data})`;
    case 'text':
      return cell.content.text;
    case 'toolRegistration':
      // Tool registration cells carry structured metadata that providers
      // pluck directly from thread.cells; the model is informed about the
      // tool through the provider's native tool channel, not text body.
      return '';
    case 'toolUse':
      // Native tool calls are sent through the provider's tools API, not the
      // text body. Providers walk turn.cells to emit structured tool_use
      // blocks; tracing/UI callers fall back to this readable rendering.
      return `[tool call: ${cell.content.toolId} ${JSON.stringify(cell.content.input)}]`;
    case 'toolResult':
      return (cell.content.content as DataCells).map((inner) => serializeCell(inner)).join('\n\n');
  }
}
