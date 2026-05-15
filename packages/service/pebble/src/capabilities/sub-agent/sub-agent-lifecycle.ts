import type { ChildLifecycle, ChildRecord } from './sub-agent-types';

/**
 * Human-facing description of a child's lifecycle, written for the model.
 * Wording is prescriptive: each branch ends with the next action the
 * parent should take so a small model doesn't have to infer policy.
 */
export function describeLifecycle(child: ChildRecord): string {
  return LIFECYCLE_DESCRIPTIONS[child.lifecycle];
}

const LIFECYCLE_DESCRIPTIONS: Record<ChildLifecycle, string> = {
  'awaiting-reply':
    "waiting for its reply — you have already called spawn-sub-agent or ask-sub-agent. Do not call any other tool targeting this child until the response arrives as a 'Sub-agent Response' context cell.",
  'idle-after-reply':
    'idle — it already responded and is no longer running. To get more work from it, call ask-sub-agent again (this wakes it for another turn). To start a clean run, call spawn-sub-agent. Do NOT assume it is still working in the background.',
  'awaiting-our-response':
    'this child asked you a question and is blocked waiting for your reply. Call respond-to-child-agent before doing anything else.',
  killed: 'stopped. Spawn a fresh child if you need this work to continue.',
};

/**
 * Short reminder paragraph appended to every per-turn Sub-agent Status
 * cell. Anchors the model's mental model: framework children run-to-
 * completion and do not progress between turns.
 */
export const NEXT_ACTION_GUIDE =
  "Each child is at the status shown above. Framework children (e.g. claude-code) run to completion in one turn and stop — they do NOT keep working between your turns. If you have not received a new 'Sub-agent Response' cell, no new response exists; sending more messages without calling ask-sub-agent or spawn-sub-agent will not unblock you.";

/**
 * One-time orientation injected in `initialize`. Slightly longer than the
 * per-turn guide; the goal is to set expectations before the first spawn
 * rather than to remind on every turn.
 */
export const LIFECYCLE_PRIMER = [
  'You can spawn child agents and message them through the sub-agent tools. Two facts to remember:',
  '',
  '1. Framework children (e.g. claude-code) run to completion in a single turn. After they respond, they are idle. They do NOT keep working in the background between your turns.',
  '2. To get a child to do more work after it responded, call ask-sub-agent again with a new message — this wakes the child for another turn. If multiple ask rounds are not making progress, call spawn-sub-agent to start a fresh child instead of repeating yourself.',
  '',
  "A 'Sub-agent Status' cell will appear at the top of each turn listing the current state of every child you have spawned.",
].join('\n');
