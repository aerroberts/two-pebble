import type { Editor } from '@tiptap/core';
import type { RichComposerSlashTrigger } from './composer-types';

const TRIGGER_PATTERN = /(?:^|[\s ])\/(\w*)$/;
const STANDALONE_TRIGGER_PATTERN = /^\/(\w*)$/;

/**
 * Inspects the editor state and returns an active slash trigger when the
 * cursor sits on a `/word` token that started after whitespace or at the
 * beginning of a paragraph. Returns `null` when no trigger is active so
 * the popover can hide cleanly.
 *
 * Anchor coords are derived from the editor view so a render-side popover
 * can position itself just under the `/`.
 */
export function readActiveSlashTrigger(editor: Editor): RichComposerSlashTrigger | null {
  const head = editor.state.selection.head;
  const lookback = Math.max(0, head - 40);
  const text = editor.state.doc.textBetween(lookback, head, '\n', '\n');
  const match = text.match(TRIGGER_PATTERN) ?? text.match(STANDALONE_TRIGGER_PATTERN);
  if (match === null) {
    return null;
  }
  const tokenLength = match[0].startsWith('/') ? match[0].length : match[0].length - 1;
  const from = head - tokenLength;
  const query = (match[1] ?? '').toLowerCase();
  const coords = safeCoordsAtPos(editor, from);
  if (coords === null) {
    return null;
  }
  return { anchorLeft: coords.left, anchorTop: coords.bottom, from, to: head, query };
}

function safeCoordsAtPos(editor: Editor, pos: number): { left: number; bottom: number } | null {
  try {
    const coords = editor.view.coordsAtPos(pos);
    return { left: coords.left, bottom: coords.bottom };
  } catch {
    return null;
  }
}

/**
 * Inserts a documentMention at the slash trigger position, replacing the
 * raw `/query` text. The cursor lands just after the inserted pill plus a
 * trailing space so the next character types normally.
 */
export function replaceTriggerWithDocumentMention(
  editor: Editor,
  trigger: RichComposerSlashTrigger,
  selection: { id: string; name: string },
): void {
  editor
    .chain()
    .focus()
    .deleteRange({ from: trigger.from, to: trigger.to })
    .insertContent([
      { type: 'documentMention', attrs: { documentId: selection.id, name: selection.name } },
      { type: 'text', text: ' ' },
    ])
    .run();
}

/**
 * Inserts voice transcript text at the cursor with a single space
 * separator from preceding text, preserving any document pills that
 * sit before the insertion point.
 */
export function insertTranscriptAtCursor(editor: Editor, text: string): void {
  if (text.length === 0) {
    return;
  }
  const head = editor.state.selection.head;
  const prevChar = head > 0 ? editor.state.doc.textBetween(head - 1, head, '\n', '\n') : '';
  const prefix = head === 0 || prevChar === '' || prevChar.endsWith(' ') ? '' : ' ';
  editor.chain().focus().insertContent(`${prefix}${text}`).run();
}
