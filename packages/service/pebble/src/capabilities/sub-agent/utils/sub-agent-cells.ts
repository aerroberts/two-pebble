import { Cell, type DataCells } from '../../../thread';
import awaitingOurResponseLifecyclePrompt from '../prompts/lifecycle-awaiting-our-response.md?raw';
import awaitingReplyLifecyclePrompt from '../prompts/lifecycle-awaiting-reply.md?raw';
import idleAfterReplyLifecyclePrompt from '../prompts/lifecycle-idle-after-reply.md?raw';
import killedLifecyclePrompt from '../prompts/lifecycle-killed.md?raw';
import type { ChildLifecycle, ChildRecord, SubAgentReference } from './sub-agent-types';

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
  return children.map((child) => Cell.text(childStatusLine(child)));
}

export function childStatusLine(child: ChildRecord): string {
  return `${child.agentId} (${child.referenceName}) — ${LIFECYCLE_DESCRIPTIONS[child.lifecycle]}`;
}

function referenceDescription(reference: SubAgentReference): string {
  const description =
    reference.description === undefined || reference.description.length === 0 ? '' : ` - ${reference.description}`;
  return `${reference.name}${description}`;
}

const LIFECYCLE_DESCRIPTIONS: Record<ChildLifecycle, string> = {
  'awaiting-reply': awaitingReplyLifecyclePrompt,
  'idle-after-reply': idleAfterReplyLifecyclePrompt,
  'awaiting-our-response': awaitingOurResponseLifecyclePrompt,
  killed: killedLifecyclePrompt,
};
