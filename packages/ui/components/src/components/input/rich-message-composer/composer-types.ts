import type { JSONContent } from '@tiptap/core';
import type { CellContent } from '@two-pebble/pebble';

export interface RichComposerDocument {
  id: string;
  name: string;
}

export interface RichComposerSubmitPayload {
  markdown: string;
  cells: CellContent[];
  /**
   * Raw TipTap document the editor committed. Lets callers that
   * persist the JSON itself (system prompts, document bodies) skip
   * the lossy markdown bounce and store the canonical shape.
   */
  doc: JSONContent;
}

export interface RichComposerSlashTrigger {
  /** Anchor coordinates relative to the viewport (left, top of the `/`). */
  anchorLeft: number;
  anchorTop: number;
  /** Document position of the `/`. */
  from: number;
  /** Document position of the cursor (end of the typed query). */
  to: number;
  /** The text typed after the `/`, lowercase. */
  query: string;
}
