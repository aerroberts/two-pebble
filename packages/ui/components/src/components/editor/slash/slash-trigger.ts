import type { Editor } from '@tiptap/core';

/**
 * Anchored `/command args` trigger detected in the editor.
 *
 * `command` is the lowercased first word right after the slash (`task`,
 * `doc`, etc.). `query` is whatever the user typed after `/command `
 * (post-space arguments). A bare `/` with no following word yields
 * `command === ''` so callers can decide whether to react.
 *
 * Anchor coords are derived from the editor view so a render-side hint
 * or popover can position itself just under the `/`.
 */
export interface SlashTrigger {
  command: string;
  query: string;
  anchorLeft: number;
  anchorTop: number;
  from: number;
  to: number;
}

const COMMAND_PATTERN = /(?:^|[\s ])\/(\w*)(?:[ \t]+(.*))?$/;

/**
 * Inspects the editor state and returns an active slash trigger when the
 * cursor sits inside a `/word [args]` token. The token may carry args
 * separated from the command by whitespace — `/task buy milk` produces
 * `{ command: 'task', query: 'buy milk' }`.
 */
export function readActiveSlashTrigger(editor: Editor): SlashTrigger | null {
  const head = editor.state.selection.head;
  const lookback = Math.max(0, head - 200);
  const text = editor.state.doc.textBetween(lookback, head, '\n', '\n');
  const match = text.match(COMMAND_PATTERN);
  if (match === null) {
    return null;
  }
  const fullMatch = match[0] ?? '';
  const slashIndex = fullMatch.indexOf('/');
  const tokenLength = fullMatch.length - slashIndex;
  const from = head - tokenLength;
  const command = (match[1] ?? '').toLowerCase();
  const query = match[2] ?? '';
  const coords = safeCoordsAtPos(editor, from);
  if (coords === null) {
    return null;
  }
  return { command, query, anchorLeft: coords.left, anchorTop: coords.bottom, from, to: head };
}

function safeCoordsAtPos(editor: Editor, pos: number): { left: number; bottom: number } | null {
  try {
    const coords = editor.view.coordsAtPos(pos);
    return { left: coords.left, bottom: coords.bottom };
  } catch {
    return null;
  }
}
