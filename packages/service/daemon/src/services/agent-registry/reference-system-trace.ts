import { Cell, type DataCells, renderMemoryReferenceText, renderSkillReferenceText } from '@two-pebble/pebble';

/**
 * Builds a trace-only system message showing the resolved reference context
 * that skill and memory cells inject into the model prompt.
 */
export function buildReferenceSystemTraceContent(cells: DataCells): DataCells | undefined {
  const blocks: DataCells = [];

  for (const cell of cells) {
    if (cell.type === 'skillReference') {
      blocks.push(Cell.header2(`Skill: ${cell.content.name}`), Cell.text(renderSkillReferenceText(cell.content)));
      continue;
    }
    if (cell.type === 'memoryReference') {
      blocks.push(Cell.header2(`Memory: ${cell.content.name}`), Cell.text(renderMemoryReferenceText(cell.content)));
    }
  }

  if (blocks.length === 0) {
    return undefined;
  }

  return [
    Cell.header1('Resolved Reference Context'),
    Cell.text('Trace-only view of resolved skill and memory context injected into the model prompt.'),
    ...blocks,
  ];
}
