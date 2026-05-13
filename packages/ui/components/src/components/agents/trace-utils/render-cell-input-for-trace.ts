import type { CellContent, DataCells } from '@two-pebble/pebble';

type TraceCellInput = CellContent | readonly CellContent[];

export function renderCellInputForTrace(input: TraceCellInput): unknown {
  if (isCellList(input)) {
    return input.map((cell) => renderCellForTrace(cell)).join('\n\n');
  }

  return renderCellForTrace(input);
}

function isCellList(input: TraceCellInput): input is readonly CellContent[] {
  return Array.isArray(input);
}

function renderCellForTrace(cell: CellContent): unknown {
  switch (cell.type) {
    case 'codeBlock':
      return `\`\`\`${cell.content.language}\n${cell.content.code}\n\`\`\``;
    case 'data':
      return `\`\`\`json\n${JSON.stringify(cell.content.value, null, 2)}\n\`\`\``;
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
