import type { CellContent } from '@two-pebble/pebble';
import type { TraceBodyCellBlock } from '../trace-body-cell';

type ToolResultInput = CellContent | readonly CellContent[];

export function readToolOutputBlock(input: {
  error: string | undefined;
  result: ToolResultInput | undefined;
}): TraceBodyCellBlock | undefined {
  if (input.error === undefined) {
    return input.result === undefined ? undefined : renderToolResultBlock(input.result);
  }

  if (input.result === undefined) {
    return {
      data: input.error,
      maxHeight: 200,
      type: 'plaintext',
    };
  }

  return {
    data: `${renderToolResultText(input.result)}\n\nError: ${input.error}`,
    maxHeight: 200,
    type: 'plaintext',
  };
}

export function estimateToolResultByteCount(result: ToolResultInput | undefined) {
  if (result === undefined) {
    return undefined;
  }

  return new TextEncoder().encode(renderToolResultText(result)).length;
}

function renderToolResultBlock(result: ToolResultInput): TraceBodyCellBlock {
  if (isToolResultList(result) && result.length === 1) {
    return renderToolCellBlock(result[0]);
  }

  if (!isToolResultList(result)) {
    return renderToolCellBlock(result);
  }

  return {
    data: result.map((cell) => renderToolCellText(cell)).join('\n\n'),
    maxHeight: 200,
    type: 'plaintext',
  };
}

function renderToolCellBlock(cell: CellContent): TraceBodyCellBlock {
  if (cell.type === 'data') {
    return {
      data: cell.content.value,
      maxHeight: 200,
      type: 'json',
    };
  }

  return {
    data: renderToolCellText(cell),
    maxHeight: 200,
    type: 'plaintext',
  };
}

function renderToolResultText(result: ToolResultInput) {
  if (isToolResultList(result)) {
    return result.map((cell) => renderToolCellText(cell)).join('\n\n');
  }

  return renderToolCellText(result);
}

function isToolResultList(result: ToolResultInput): result is readonly CellContent[] {
  return Array.isArray(result);
}

function renderToolCellText(cell: CellContent) {
  switch (cell.type) {
    case 'boardReference':
      return `[board: ${cell.content.name} (id: ${cell.content.boardId})]`;
    case 'codeBlock':
      return cell.content.code;
    case 'data':
      return JSON.stringify(cell.content.value, null, 2);
    case 'documentReference':
      return `[document: ${cell.content.name}]\n\n${cell.content.contentSnapshot}`;
    case 'memoryReference':
      return `[memory: ${cell.content.name}]`;
    case 'header1':
      return `# ${cell.content.text}`;
    case 'header2':
      return `## ${cell.content.text}`;
    case 'image':
      return '[image]';
    case 'text':
      return cell.content.text;
  }
}
