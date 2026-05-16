import type { Editor } from '@tiptap/core';
import type { SlashTrigger } from './slash-trigger';

/**
 * Removes the `/command args` text run from the editor without inserting
 * anything in its place. The caller is responsible for following up with
 * whatever node or content should land at the deletion point.
 */
export function deleteTriggerRange(editor: Editor, trigger: SlashTrigger): void {
  editor.chain().focus().deleteRange({ from: trigger.from, to: trigger.to }).run();
}
