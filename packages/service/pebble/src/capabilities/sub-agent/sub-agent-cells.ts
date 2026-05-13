import { Cell, type DataCells } from '../../thread';
import type { ChildRecord, SubAgentReference } from './sub-agent-types';

export function listSubAgentsCells(references: SubAgentReference[], children: ChildRecord[]): DataCells {
  return [
    Cell.header2('Configured sub-agents'),
    ...referenceCells(references),
    Cell.header2('Spawned child agents'),
    ...childCells(children),
  ];
}

function referenceCells(references: SubAgentReference[]): DataCells {
  if (references.length === 0) {
    return [Cell.text('No configured sub-agent references.')];
  }
  return references.map((reference) => Cell.text(referenceDescription(reference)));
}

function childCells(children: ChildRecord[]): DataCells {
  if (children.length === 0) {
    return [Cell.text('No spawned child agents.')];
  }
  return children.map((child) => Cell.text(`${child.agentId} (${child.referenceName})`));
}

function referenceDescription(reference: SubAgentReference): string {
  const description =
    reference.description === undefined || reference.description.length === 0 ? '' : ` - ${reference.description}`;
  return `${reference.name}${description}`;
}
